import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../../shared/manual-clock.test-support.js";
import { SeededRandom } from "../../../../shared/random.js";
import { c, riggedDeck } from "../../domain/round/round.test-support.js";
import { InMemoryGameRepository } from "../../infrastructure/repositories/in-memory-game-repository.js";
import { DiscardCard } from "./discard-card.js";
import { DrawCard } from "./draw-card.js";
import { StartGame } from "./start-game.js";
import { StartNextRound } from "./start-next-round.js";
import { TimeOutTurn } from "./time-out-turn.js";
import { harness } from "./use-cases.test-support.js";

const DECK = riggedDeck(["2C 3C 4C 6C 8C 10C JC QC 2D 3D", "7H 7S 7D 9H 9S 9D KH KS KD 5D"], "QS", "AC 4H");

describe("Iniciar partida", () => {
  const config = { mode: "APUNTADO" as const, eliminationThreshold: 101, turnSeconds: 60 };

  it("crea la sesión y la guarda", () => {
    const games = new InMemoryGameRepository();
    const start = new StartGame(games, new SeededRandom(1), new ManualClock());
    expect(start.execute({ gameId: "g9", playerIds: ["ana", "luis"], config })).toEqual({ ok: true });
    expect(games.find("g9")?.currentStatus).toBe("PLAYING");
  });

  it("no crea dos partidas con el mismo identificador", () => {
    const games = new InMemoryGameRepository();
    const start = new StartGame(games, new SeededRandom(1), new ManualClock());
    start.execute({ gameId: "g9", playerIds: ["ana", "luis"], config });
    expect(start.execute({ gameId: "g9", playerIds: ["ana", "luis"], config }).ok).toBe(false);
  });
});

describe("Robar y descartar", () => {
  it("robar del mazo deja la carta robada en la bitácora", () => {
    const h = harness(DECK);
    const draw = new DrawCard(h.games, h.journal, h.events, h.clock);
    expect(draw.execute({ gameId: "g1", playerId: "ana", source: "STOCK" })).toEqual({ ok: true });
    expect(h.journal.entries).toMatchObject([{ action: "ROBAR_MAZO", playerId: "ana", cardId: "AC" }]);
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

  it("al vencer, roba y descarta por el jugador y pasa el turno", () => {
    const h = harness(DECK);
    h.clock.advance(60);
    expect(new TimeOutTurn(h.games, h.journal, h.events, h.clock).execute("g1")).toEqual({ ok: true });
    expect(h.session.currentRound.currentPlayerId).toBe("luis");
    expect(h.journal.entries).toMatchObject([{ action: "DESCARTAR", playerId: "ana", cardId: "AC" }]);
  });
});

describe("Siguiente ronda", () => {
  it("solo procede cuando la ronda actual terminó", () => {
    const h = harness(DECK);
    expect(new StartNextRound(h.games).execute("g1").ok).toBe(false);
  });
});
