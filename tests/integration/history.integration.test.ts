import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MatchArchiver } from "../../apps/api/src/modules/history/application/match-archiver.js";
import { PgMatchRecords } from "../../apps/api/src/modules/history/infrastructure/pg-match-records.js";
import { PgProfileReader } from "../../apps/api/src/modules/history/infrastructure/pg-profile-reader.js";
import { PgPlayJournal } from "../../apps/api/src/modules/game/infrastructure/journal/pg-play-journal.js";
import { PgPlayerRegistry } from "../../apps/api/src/modules/identity/infrastructure/pg-player-registry.js";
import { createDatabase, type Database } from "../../apps/api/src/shared/database/database.js";
import { runMigrations } from "../../apps/api/src/shared/database/migrations.js";
import { RandomIds } from "../../apps/api/src/shared/ids.js";
import type { MatchStarted, RoundClosed, RoundStarted } from "../../apps/api/src/modules/game/index.js";
import { PgliteSqlClient } from "../support/pglite-sql-client.js";

const ANA = "00000000-0000-4000-8000-000000000001";
const LUIS = "00000000-0000-4000-8000-000000000002";
const BOT = "bot:1";
const MATCH = "10000000-0000-4000-8000-000000000001";
const CONFIG = { mode: "APUNTADO", eliminationThreshold: 101, turnSeconds: 60 } as const;
const T0 = new Date("2026-11-12T15:00:00Z");
const at = (minutes: number) => new Date(T0.getTime() + minutes * 60_000);
const HAND = (suit: string) => ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((rank) => `${rank}${suit}`);

let sql: PgliteSqlClient;
let database: Database;
let errors: unknown[];

beforeEach(async () => {
  sql = new PgliteSqlClient();
  await runMigrations(sql);
  errors = [];
  database = createDatabase(sql, (error) => errors.push(error));
}, 60_000);

afterEach(async () => {
  await sql.close();
});

const started = (matchId = MATCH): MatchStarted => ({
  name: "PartidaIniciada",
  gameId: "ABCD",
  matchId,
  at: T0,
  config: CONFIG,
  stake: 0,
  seats: [
    { playerId: ANA, nickname: "Ana", isBot: false },
    { playerId: LUIS, nickname: "Luis", isBot: false },
    { playerId: BOT, nickname: "Máquina 1", isBot: true },
  ],
});

const roundStarted = (roundNumber: number, playerIds: readonly string[], matchId = MATCH): RoundStarted => ({
  name: "RondaIniciada",
  gameId: "ABCD",
  matchId,
  at: at(roundNumber * 10),
  roundNumber,
  hands: playerIds.map((playerId, i) => ({ playerId, cards: HAND("HDC"[i]!) })),
});

const roundClosed = (
  roundNumber: number,
  winnerId: string | null,
  closureType: "CLASICO" | "APUNTADO" | null,
  lines: readonly [string, number, number, boolean][],
  matchId = MATCH,
): RoundClosed => ({
  name: "RondaCerrada",
  gameId: "ABCD",
  matchId,
  at: at(roundNumber * 10 + 5),
  summary: { roundNumber, winnerId, closureType, scores: lines.map(([playerId, points]) => ({ playerId, points })) },
  scoreboard: lines.map(([playerId, , total, eliminated]) => ({ playerId, total, eliminated })),
});

const playFullMatch = async (archiver: MatchArchiver, journal: PgPlayJournal) => {
  archiver.matchStarted(started());
  archiver.roundStarted(roundStarted(1, [ANA, LUIS, BOT]));
  const play = (playerId: string, seat: number, action: "ROBAR_MAZO" | "DESCARTAR" | "DECLARAR_CIERRE", cardId: string) =>
    journal.record({ gameId: "ABCD", matchId: MATCH, roundNumber: 1, playerId, seat, action, cardId, occurredAt: at(11) });
  play(ANA, 1, "ROBAR_MAZO", "KS");
  play(ANA, 1, "DESCARTAR", "KS");
  play(LUIS, 2, "ROBAR_MAZO", "QS");
  play(LUIS, 2, "DECLARAR_CIERRE", "QS");
  archiver.roundClosed(roundClosed(1, LUIS, "APUNTADO", [[ANA, 30, 30, false], [LUIS, 0, 0, false], [BOT, 120, 120, true]]));
  archiver.roundStarted(roundStarted(2, [ANA, LUIS]));
  archiver.roundClosed(roundClosed(2, LUIS, "CLASICO", [[ANA, 80, 110, true], [LUIS, 0, 0, false]]));
  archiver.matchFinished({ name: "PartidaFinalizada", gameId: "ABCD", matchId: MATCH, at: at(30), winnerId: LUIS, scoreboard: [] });
  await database.queue.idle();
};

const setUp = () => {
  const players = new PgPlayerRegistry(database);
  players.remember({ id: ANA, nickname: "Ana", kind: "INVITADO" });
  players.remember({ id: LUIS, nickname: "Luis", kind: "INVITADO" });
  return { archiver: new MatchArchiver(new PgMatchRecords(database, new RandomIds())), journal: new PgPlayJournal(database) };
};

describe("Migraciones", () => {
  it("aplican el esquema del E2 y el catálogo de cartas una sola vez", async () => {
    const fresh = new PgliteSqlClient();
    expect(await runMigrations(fresh)).toEqual(["001-esquema-e2", "002-catalogo-de-cartas", "003-ronda-sin-ganador"]);
    expect(await runMigrations(fresh)).toEqual([]);
    const [{ total }] = (await fresh.query<{ total: number }>("SELECT COUNT(*)::int AS total FROM carta")) as [{ total: number }];
    expect(total).toBe(52);
    expect(await fresh.query("SELECT codigo FROM carta WHERE codigo = '10H'")).toHaveLength(1);
    await fresh.close();
  }, 60_000);
});

describe("Archivo de una partida por eventos", () => {
  it("registra la partida, sus participantes, rondas, manos, puntajes y bitácora", async () => {
    const { archiver, journal } = setUp();
    await playFullMatch(archiver, journal);
    expect(errors).toEqual([]);

    const [match] = await sql.query<Record<string, unknown>>("SELECT modo, estado, ganador_id, version, config_reglas FROM partida");
    expect(match).toMatchObject({ modo: "SALA_PRIVADA", estado: "FINALIZADA", ganador_id: LUIS, version: 2 });
    expect(match?.["config_reglas"]).toMatchObject({ modalidad: "APUNTADO", umbral: 101 });

    const seats = await sql.query("SELECT posicion, jugador_id, apodo_invitado, eliminado_en_ronda FROM participacion ORDER BY posicion");
    expect(seats).toEqual([
      { posicion: 1, jugador_id: ANA, apodo_invitado: null, eliminado_en_ronda: 2 },
      { posicion: 2, jugador_id: LUIS, apodo_invitado: null, eliminado_en_ronda: null },
      { posicion: 3, jugador_id: null, apodo_invitado: "Máquina 1", eliminado_en_ronda: 1 },
    ]);

    const rounds = await sql.query("SELECT numero, tipo_cierre FROM ronda WHERE cerrada_en IS NOT NULL ORDER BY numero");
    expect(rounds).toEqual([{ numero: 1, tipo_cierre: "APUNTADO" }, { numero: 2, tipo_cierre: "CLASICO" }]);
    expect(await sql.query("SELECT 1 FROM mano_carta")).toHaveLength(50);

    const plays = await sql.query("SELECT numero_turno, secuencia, accion, rtrim(carta_codigo) AS carta FROM turno_jugada ORDER BY id");
    expect(plays).toEqual([
      { numero_turno: 1, secuencia: 1, accion: "ROBAR_MAZO", carta: "KS" },
      { numero_turno: 1, secuencia: 2, accion: "DESCARTAR", carta: "KS" },
      { numero_turno: 2, secuencia: 1, accion: "ROBAR_MAZO", carta: "QS" },
      { numero_turno: 2, secuencia: 2, accion: "DECLARAR_CIERRE", carta: "QS" },
    ]);
  });

  it("el perfil resume las partidas terminadas de cada jugador", async () => {
    const { archiver, journal } = setUp();
    await playFullMatch(archiver, journal);
    const profiles = new PgProfileReader(sql);

    expect(await profiles.statsOf(LUIS)).toEqual({
      played: 1,
      won: 1,
      roundsWon: 2,
      apuntadoClosures: 1,
      recent: [{ matchId: MATCH, finishedAt: at(30).toISOString(), mode: "APUNTADO", won: true, points: 0, rounds: 2, rivals: ["Ana", "Máquina 1"] }],
    });
    expect(await profiles.statsOf(ANA)).toMatchObject({ played: 1, won: 0, roundsWon: 0, recent: [{ won: false, points: 110 }] });
    expect(await profiles.statsOf("00000000-0000-4000-8000-0000000000ff")).toEqual({
      played: 0,
      won: 0,
      roundsWon: 0,
      apuntadoClosures: 0,
      recent: [],
    });
  });

});

describe("Archivo de una partida · casos borde", () => {
  it("una partida en curso todavía no aparece en el perfil", async () => {
    const { archiver } = setUp();
    archiver.matchStarted(started());
    archiver.roundStarted(roundStarted(1, [ANA, LUIS, BOT]));
    await database.queue.idle();
    expect(await new PgProfileReader(sql).statsOf(ANA)).toMatchObject({ played: 0, recent: [] });
  });

  it("una ronda que termina sin ganador queda cerrada sin tipo de cierre", async () => {
    const { archiver } = setUp();
    archiver.matchStarted(started());
    archiver.roundStarted(roundStarted(1, [ANA, LUIS, BOT]));
    archiver.roundClosed(roundClosed(1, null, null, [[ANA, 20, 20, false], [LUIS, 15, 15, false], [BOT, 40, 40, false]]));
    await database.queue.idle();
    expect(errors).toEqual([]);
    expect(await sql.query("SELECT tipo_cierre, ganador_participacion_id FROM ronda WHERE cerrada_en IS NOT NULL")).toEqual([
      { tipo_cierre: null, ganador_participacion_id: null },
    ]);
  });

  it("liquidar dos veces la misma ronda falla completa y no deja puntajes ni versiones a medias", async () => {
    const { archiver } = setUp();
    archiver.matchStarted(started());
    archiver.roundStarted(roundStarted(1, [ANA, LUIS, BOT]));
    const closing = roundClosed(1, LUIS, "APUNTADO", [[ANA, 30, 30, false], [LUIS, 0, 0, false], [BOT, 40, 40, false]]);
    archiver.roundClosed(closing);
    archiver.roundClosed(closing);
    await database.queue.idle();
    expect(errors).toHaveLength(1);
    expect(await sql.query("SELECT 1 FROM puntaje_acumulado")).toHaveLength(3);
    expect(await sql.query("SELECT version FROM partida")).toEqual([{ version: 1 }]);
  });

  it("si el jugador no quedó registrado, la partida se archiva igual con su apodo", async () => {
    const archiver = new MatchArchiver(new PgMatchRecords(database, new RandomIds()));
    archiver.matchStarted(started());
    await database.queue.idle();
    expect(errors).toEqual([]);
    expect(await sql.query("SELECT jugador_id, apodo_invitado FROM participacion WHERE posicion = 1")).toEqual([
      { jugador_id: null, apodo_invitado: "Ana" },
    ]);
  });

  it("contra la máquina, con un solo humano, la partida se registra como VS_MAQUINA", async () => {
    const { archiver } = setUp();
    archiver.matchStarted({ ...started(), seats: started().seats.filter((s) => s.playerId !== LUIS) });
    await database.queue.idle();
    expect(await sql.query("SELECT modo FROM partida")).toEqual([{ modo: "VS_MAQUINA" }]);
  });
});
