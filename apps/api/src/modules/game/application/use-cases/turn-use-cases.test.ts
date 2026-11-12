import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../../shared/manual-clock.test-support.js";
import { SeededRandom } from "../../../../shared/random.js";
import { c, riggedDeck } from "../../domain/round/round.test-support.js";
import type { GameSession } from "../../domain/session/game-session.js";
import { InMemoryGameRepository } from "../../infrastructure/repositories/in-memory-game-repository.js";
import { DiscardCard } from "./discard-card.js";
import { DrawCard } from "./draw-card.js";
import { StartGame } from "./start-game.js";
import { StartNextRound } from "./start-next-round.js";
import { TimeOutTurn } from "./time-out-turn.js";
import { EventSpy, FakeStakes, harness, seatsOf, sequentialIds } from "./use-cases.test-support.js";

const startGame = (games: InMemoryGameRepository, events = new EventSpy(), stakes = new FakeStakes()) =>
  new StartGame({ games, random: new SeededRandom(1), clock: new ManualClock(), ids: sequentialIds(), events, stakes });

const playUntilLastStockDraw = (session: GameSession) => {
  let stockEmptiedOnce = false;
  for (;;) {
    const round = session.currentRound;
    const player = round.currentPlayerId;
    if (round.currentPhase === "DISCARD") {
      session.discard(player, round.handOf(player).at(-1)!);
      continue;
    }
    if (round.stockSize === 0) {
      if (stockEmptiedOnce) return;
      stockEmptiedOnce = true;
    }
    session.drawFromStock(player);
  }
};

const exhaustRound = (session: GameSession) => {
  playUntilLastStockDraw(session);
  session.drawFromStock(session.currentRound.currentPlayerId);
};

const DECK = riggedDeck(["2C 3C 4C 6C 8C 10C JC QC 2D 3D", "7H 7S 7D 9H 9S 9D KH KS KD 5D"], "QS", "AC 4H");

describe("Iniciar partida", () => {
  const config = { mode: "APUNTADO" as const, eliminationThreshold: 101, turnSeconds: 60 };

  it("crea la sesión y la guarda", () => {
    const games = new InMemoryGameRepository();
    const start = startGame(games);
    expect(start.execute({ gameId: "g9", seats: seatsOf(["ana", "luis"]), config, stake: 0 })).toEqual({ ok: true });
    expect(games.find("g9")?.currentStatus).toBe("PLAYING");
  });

  it.each([
    ["un solo jugador", ["ana"], config, "Una partida necesita de 2 a 4 jugadores"],
    ["cinco jugadores", ["a", "b", "c", "d", "e"], config, "Una partida necesita de 2 a 4 jugadores"],
    ["jugadores repetidos", ["ana", "ana"], config, "Los jugadores de una partida deben ser distintos"],
    ["umbral en cero", ["ana", "luis"], { ...config, eliminationThreshold: 0 }, "El umbral debe ser un entero positivo"],
    ["turno sin duración", ["ana", "luis"], { ...config, turnSeconds: 0 }, "La duración del turno debe ser un entero positivo"],
  ])("rechaza con motivo, sin lanzar errores, una partida con %s", (_caso, playerIds, cfg, reason) => {
    const games = new InMemoryGameRepository();
    const start = startGame(games);
    expect(start.execute({ gameId: "g9", seats: seatsOf(playerIds), config: cfg, stake: 0 })).toEqual({ ok: false, reason });
    expect(games.find("g9")).toBeNull();
  });

  it("anuncia la partida con sus asientos y configuración, y luego la primera ronda", () => {
    const games = new InMemoryGameRepository();
    const events = new EventSpy();
    const seats = [...seatsOf(["ana"]), { playerId: "bot:1", nickname: "Máquina 1", isBot: true }];
    startGame(games, events).execute({ gameId: "g9", seats, config, stake: 0 });
    expect(events.names).toEqual(["PartidaIniciada", "RondaIniciada"]);
    const matchId = games.find("g9")?.matchId;
    expect(matchId).toBe("match-1");
    expect(events.published[0]?.payload).toMatchObject({ gameId: "g9", matchId, config, stake: 0, seats });
    expect(events.published[1]?.payload).toMatchObject({ matchId, roundNumber: 1 });
  });

  it("una partida rechazada no anuncia nada", () => {
    const events = new EventSpy();
    startGame(new InMemoryGameRepository(), events).execute({ gameId: "g9", seats: seatsOf(["ana"]), config, stake: 0 });
    expect(events.names).toEqual([]);
  });

  it("no crea dos partidas con el mismo identificador", () => {
    const games = new InMemoryGameRepository();
    const start = startGame(games);
    start.execute({ gameId: "g9", seats: seatsOf(["ana", "luis"]), config, stake: 0 });
    expect(start.execute({ gameId: "g9", seats: seatsOf(["ana", "luis"]), config, stake: 0 }).ok).toBe(false);
  });
});

describe("Iniciar partida con apuesta", () => {
  const config = { mode: "CLASICA" as const, eliminationThreshold: 101, turnSeconds: 60 };

  it("retiene la apuesta de los jugadores con el identificador de la partida", () => {
    const games = new InMemoryGameRepository();
    const stakes = new FakeStakes({ ana: 200, luis: 200 });
    expect(startGame(games, new EventSpy(), stakes).execute({ gameId: "g9", seats: seatsOf(["ana", "luis"]), config, stake: 150 }).ok).toBe(true);
    expect(stakes.holds).toEqual([{ matchId: games.find("g9")?.matchId, playerIds: ["ana", "luis"], stake: 150 }]);
  });

  it("si la retención falla no crea la partida ni anuncia nada", () => {
    const games = new InMemoryGameRepository();
    const events = new EventSpy();
    const result = startGame(games, events, new FakeStakes({ ana: 200, luis: 10 })).execute({ gameId: "g9", seats: seatsOf(["ana", "luis"]), config, stake: 150 });
    expect(result).toEqual({ ok: false, reason: "Sin fichas suficientes" });
    expect(games.find("g9")).toBeNull();
    expect(events.names).toEqual([]);
  });

  it("no inicia una partida con apuesta en la que se sienta la máquina", () => {
    const games = new InMemoryGameRepository();
    const seats = [...seatsOf(["ana"]), { playerId: "bot:1", nickname: "Máquina 1", isBot: true }];
    const result = startGame(games, new EventSpy(), new FakeStakes({ ana: 500 })).execute({ gameId: "g9", seats, config, stake: 50 });
    expect(result).toEqual({ ok: false, reason: "La máquina no juega en mesas con apuesta" });
  });
});

describe("Robar y descartar", () => {
  it("robar del mazo deja la carta robada en la bitácora", () => {
    const h = harness(DECK);
    const draw = new DrawCard(h.games, h.journal, h.events, h.clock);
    expect(draw.execute({ gameId: "g1", playerId: "ana", source: "STOCK" })).toEqual({ ok: true });
    expect(h.journal.entries).toMatchObject([{ action: "ROBAR_MAZO", playerId: "ana", cardId: "AC" }]);
  });

  it("cada jugada registrada identifica la partida, la ronda y el asiento de quien juega", () => {
    const h = harness(DECK);
    new DrawCard(h.games, h.journal, h.events, h.clock).execute({ gameId: "g1", playerId: "ana", source: "STOCK" });
    expect(h.journal.entries).toMatchObject([{ gameId: "g1", matchId: "m1", roundNumber: 1, seat: 2 }]);
  });

  it("tomar del pozo registra la carta tomada", () => {
    const h = harness(DECK);
    new DrawCard(h.games, h.journal, h.events, h.clock).execute({ gameId: "g1", playerId: "ana", source: "DISCARD" });
    expect(h.journal.entries).toMatchObject([{ action: "ROBAR_POZO", cardId: "QS" }]);
  });

  it("una jugada rechazada no se registra", () => {
    const h = harness(DECK);
    const draw = new DrawCard(h.games, h.journal, h.events, h.clock);
    expect(draw.execute({ gameId: "g1", playerId: "luis", source: "STOCK" }).ok).toBe(false);
    expect(h.journal.entries).toHaveLength(0);
  });

  it("descartar registra la carta y pasa el turno", () => {
    const h = harness(DECK);
    new DrawCard(h.games, h.journal, h.events, h.clock).execute({ gameId: "g1", playerId: "ana", source: "STOCK" });
    new DiscardCard(h.games, h.journal, h.events, h.clock).execute({ gameId: "g1", playerId: "ana", card: c("5D") });
    expect(h.journal.entries.at(-1)).toMatchObject({ action: "DESCARTAR", cardId: "5D" });
    expect(h.session.currentRound.currentPlayerId).toBe("luis");
  });
});

describe("Vencimiento del turno", () => {
  it("no actúa antes de la hora límite", () => {
    const h = harness(DECK);
    h.clock.advance(59);
    expect(new TimeOutTurn(h.games, h.journal, h.events, h.clock).execute("g1"))
      .toEqual({ ok: false, reason: "El turno todavía no ha vencido" });
  });

  it("al vencer, roba y descarta por el jugador, registra las dos jugadas y pasa el turno", () => {
    const h = harness(DECK);
    h.clock.advance(60);
    expect(new TimeOutTurn(h.games, h.journal, h.events, h.clock).execute("g1")).toEqual({ ok: true });
    expect(h.session.currentRound.currentPlayerId).toBe("luis");
    expect(h.journal.entries).toMatchObject([
      { action: "ROBAR_MAZO", playerId: "ana", cardId: "AC" },
      { action: "DESCARTAR", playerId: "ana", cardId: "AC" },
    ]);
  });

  it("si ya había robado, al vencer solo registra el descarte automático", () => {
    const h = harness(DECK);
    h.session.drawFromStock("ana");
    h.clock.advance(60);
    new TimeOutTurn(h.games, h.journal, h.events, h.clock).execute("g1");
    expect(h.journal.entries).toMatchObject([{ action: "DESCARTAR", playerId: "ana", cardId: "AC" }]);
  });

  it("entre rondas responde que no hay ronda en juego", () => {
    const h = harness(DECK, "APUNTADO");
    exhaustRound(h.session);
    h.clock.advance(600);
    expect(new TimeOutTurn(h.games, h.journal, h.events, h.clock).execute("g1"))
      .toEqual({ ok: false, reason: "No hay una ronda en juego" });
  });
});

describe("Mazo agotado", () => {
  it("si al robar del mazo la ronda termina sin ganador, no registra un robo que no ocurrió", () => {
    const h = harness(DECK, "APUNTADO");
    const draw = new DrawCard(h.games, h.journal, h.events, h.clock);
    playUntilLastStockDraw(h.session);
    const player = h.session.currentRound.currentPlayerId;
    expect(draw.execute({ gameId: "g1", playerId: player, source: "STOCK" })).toEqual({ ok: true });
    expect(h.session.currentStatus).toBe("ROUND_OVER");
    expect(h.journal.entries).toHaveLength(0);
    expect(h.events.names).toEqual(["RondaCerrada"]);
  });
});

describe("Siguiente ronda", () => {
  it("solo procede cuando la ronda actual terminó", () => {
    const h = harness(DECK);
    expect(new StartNextRound(h.games, h.events).execute("g1").ok).toBe(false);
    expect(h.events.names).toEqual([]);
  });

  it("al empezar la siguiente ronda la anuncia", () => {
    const h = harness(DECK, "APUNTADO");
    exhaustRound(h.session);
    h.session.pullEvents();
    expect(new StartNextRound(h.games, h.events).execute("g1")).toEqual({ ok: true });
    expect(h.events.published).toMatchObject([{ name: "RondaIniciada", payload: { matchId: "m1", roundNumber: 2 } }]);
  });
});
