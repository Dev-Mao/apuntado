import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ChipBank } from "../../apps/api/src/modules/economy/application/chip-bank.js";
import { ChipLedger } from "../../apps/api/src/modules/economy/domain/chip-ledger.js";
import { PgMovementStore } from "../../apps/api/src/modules/economy/infrastructure/pg-movement-store.js";
import type { MatchStarted } from "../../apps/api/src/modules/game/index.js";
import { MatchArchiver } from "../../apps/api/src/modules/history/application/match-archiver.js";
import { PgMatchRecords } from "../../apps/api/src/modules/history/infrastructure/pg-match-records.js";
import { PgAccountStore } from "../../apps/api/src/modules/identity/infrastructure/pg-account-store.js";
import { PgPlayerRegistry } from "../../apps/api/src/modules/identity/infrastructure/pg-player-registry.js";
import { createDatabase, type Database } from "../../apps/api/src/shared/database/database.js";
import { runMigrations } from "../../apps/api/src/shared/database/migrations.js";
import { RandomIds } from "../../apps/api/src/shared/ids.js";
import { InProcessEventBus } from "../../apps/api/src/shared/in-process-event-bus.js";
import { PgliteSqlClient } from "../support/pglite-sql-client.js";

const EVA = "00000000-0000-4000-8000-0000000000e1";
const TOM = "00000000-0000-4000-8000-0000000000e2";
const MATCH = "10000000-0000-4000-8000-0000000000e1";

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

const accounts = () => new PgAccountStore(database);

const registered = async () => {
  await accounts().register({ id: EVA, nickname: "Eva", kind: "REGISTRADO" }, "eva@example.com", "h-eva");
  await accounts().register({ id: TOM, nickname: "Tom", kind: "REGISTRADO" }, "tom@example.com", "h-tom");
};

const openBank = async () => {
  const bank = new ChipBank(new ChipLedger(), new PgMovementStore(database));
  await bank.open();
  return bank;
};

const started = (stake: number): MatchStarted => ({
  name: "PartidaIniciada",
  gameId: "ABCD",
  matchId: MATCH,
  at: new Date(),
  config: { mode: "CLASICA", eliminationThreshold: 101, turnSeconds: 60 },
  stake,
  seats: [
    { playerId: EVA, nickname: "Eva", isBot: false },
    { playerId: TOM, nickname: "Tom", isBot: false },
  ],
});

const balances = async () =>
  Object.fromEntries((await sql.query<{ jugador_id: string; saldo: number }>("SELECT jugador_id, saldo::int AS saldo FROM saldo_jugador")).map((r) => [r.jugador_id, r.saldo]));

describe("Cuentas en PostgreSQL", () => {
  it("guarda la cuenta registrada con su contraseña cifrada y la encuentra por correo", async () => {
    expect(await accounts().register({ id: EVA, nickname: "Eva", kind: "REGISTRADO" }, "eva@example.com", "hash")).toBe("CREATED");
    expect(await sql.query("SELECT correo, hash_contrasena, tipo FROM jugador")).toEqual([
      { correo: "eva@example.com", hash_contrasena: "hash", tipo: "REGISTRADO" },
    ]);
    expect(await accounts().findByEmail("eva@example.com")).toEqual({ player: { id: EVA, nickname: "Eva", kind: "REGISTRADO" }, passwordHash: "hash" });
    expect(await accounts().findByEmail("otra@example.com")).toBeNull();
  });

  it("un invitado que se registra conserva su fila y su identificador", async () => {
    new PgPlayerRegistry(database).remember({ id: EVA, nickname: "Evita", kind: "INVITADO" });
    await database.queue.idle();
    await accounts().register({ id: EVA, nickname: "Eva", kind: "REGISTRADO" }, "eva@example.com", "hash");
    expect(await sql.query("SELECT id, apodo, tipo FROM jugador")).toEqual([{ id: EVA, apodo: "Eva", tipo: "REGISTRADO" }]);
  });

  it("un correo repetido se informa sin lanzar errores", async () => {
    await accounts().register({ id: EVA, nickname: "Eva", kind: "REGISTRADO" }, "eva@example.com", "hash");
    expect(await accounts().register({ id: TOM, nickname: "Tom", kind: "REGISTRADO" }, "eva@example.com", "hash")).toBe("EMAIL_TAKEN");
  });
});

describe("Libro de fichas en PostgreSQL", () => {
  it("bono, retención y bote quedan en el libro, y el saldo derivado coincide con el de memoria", async () => {
    await registered();
    const bank = await openBank();
    bank.grantWelcomeBonus(EVA);
    bank.grantWelcomeBonus(TOM);
    const events = new InProcessEventBus();
    new MatchArchiver(new PgMatchRecords(database, new RandomIds())).listenTo(events);
    bank.listenTo(events);

    expect(bank.hold(MATCH, [EVA, TOM], 100)).toEqual({ ok: true });
    events.publish("PartidaIniciada", { ...started(100) });
    await Promise.resolve();
    await database.queue.idle();
    bank.matchFinished({ matchId: MATCH, winnerId: TOM });
    await database.queue.idle();

    expect(errors).toEqual([]);
    expect(await balances()).toEqual({ [EVA]: 900, [TOM]: 1100 });
    expect((await bank.walletOf(EVA)).balance).toBe(900);
    expect((await bank.walletOf(TOM)).movements.map((m) => m.reason)).toEqual(["BOTE_GANADO", "APUESTA_RETENIDA", "BONO_BIENVENIDA"]);
    const [{ total }] = (await sql.query<{ total: number }>("SELECT SUM(saldo)::int AS total FROM saldo_jugador")) as [{ total: number }];
    expect(total).toBe(2000);
  });

  it("al reabrir devuelve una sola vez las retenciones que quedaron sin liquidar", async () => {
    await registered();
    const bank = await openBank();
    bank.grantWelcomeBonus(EVA);
    bank.grantWelcomeBonus(TOM);
    new MatchArchiver(new PgMatchRecords(database, new RandomIds())).matchStarted(started(200));
    bank.hold(MATCH, [EVA, TOM], 200);
    bank.matchStarted({ matchId: MATCH });
    await database.queue.idle();
    expect(await balances()).toEqual({ [EVA]: 800, [TOM]: 800 });

    await openBank();
    await database.queue.idle();
    expect(await balances()).toEqual({ [EVA]: 1000, [TOM]: 1000 });

    const again = await openBank();
    await database.queue.idle();
    expect(await balances()).toEqual({ [EVA]: 1000, [TOM]: 1000 });
    expect(again.canCover(EVA, 1000)).toBe(true);
    expect(errors).toEqual([]);
  });
});
