import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../../shared/manual-clock.test-support.js";
import { SeededRandom } from "../../../../shared/random.js";
import type { GameMode } from "../match/match.js";
import { ClassicRule } from "../rules/classic-rule.js";
import { c, cards, riggedDeck } from "../round/round.test-support.js";
import { GameSession } from "./game-session.js";

const CLOSING_DECK = riggedDeck(["7H 7S 7D 7C KH KS KD 4C 4D 4H", "2C 3C 5C 6C 8C 9C 10C JC QC 2D"], "AC", "3S 9S");
const CLASSIC = {
  type: "CLASICO" as const,
  melds: [cards("7H 7S 7D 7C"), cards("KH KS KD"), cards("4C 4D 4H")],
  leftovers: [],
  discard: c("9S"),
};

const session = (mode: GameMode = "AMBAS", clock = new ManualClock()) =>
  GameSession.start("g1", ["ana", "luis"], { mode, eliminationThreshold: 101, turnSeconds: 60 }, {
    random: new SeededRandom(9),
    clock,
    newDeck: () => [...CLOSING_DECK],
  });

const anaClosesAfterLuisTurn = (s: GameSession) => {
  s.drawFromStock("luis");
  s.discard("luis", c("3S"));
  s.drawFromStock("ana");
  return s.declareClosure("ana", CLASSIC, new ClassicRule());
};

describe("Sesión de juego · turno y reloj", () => {
  it("empieza la primera ronda con el jugador a la izquierda del repartidor", () => {
    const s = session();
    expect(s.currentStatus).toBe("PLAYING");
    expect(s.currentRoundNumber).toBe(1);
    expect(s.currentRound.currentPlayerId).toBe("luis");
  });

  it("la hora límite del turno se fija al empezar y se reinicia cuando cambia el jugador, no al robar", () => {
    const clock = new ManualClock();
    const s = session("AMBAS", clock);
    const first = s.turnDeadline;
    clock.advance(10);
    s.drawFromStock("luis");
    expect(s.turnDeadline).toEqual(first);
    s.discard("luis", s.currentRound.handOf("luis").at(-1)!);
    expect(s.turnDeadline.getTime() - first.getTime()).toBe(10_000);
  });

  it("el turno vence cuando el reloj alcanza la hora límite", () => {
    const clock = new ManualClock();
    const s = session("AMBAS", clock);
    clock.advance(59);
    expect(s.isTurnExpired()).toBe(false);
    clock.advance(1);
    expect(s.isTurnExpired()).toBe(true);
  });
});

describe("Sesión de juego · fin de ronda", () => {
  it("en una partida de varias rondas, al cerrar se liquida la ronda y queda a la espera de la siguiente", () => {
    const s = session("AMBAS");
    anaClosesAfterLuisTurn(s);
    expect(s.currentStatus).toBe("ROUND_OVER");
    expect(s.lastRound).toMatchObject({ roundNumber: 1, winnerId: "ana", closureType: "CLASICO" });
    expect(s.scoreboard.find((l) => l.playerId === "ana")?.total).toBe(0);
    expect(s.scoreboard.find((l) => l.playerId === "luis")?.total).toBeGreaterThan(0);
  });

  it("publica el evento RondaCerrada una sola vez", () => {
    const s = session("AMBAS");
    anaClosesAfterLuisTurn(s);
    expect(s.pullEvents().map((e) => e.name)).toEqual(["RondaCerrada"]);
    expect(s.pullEvents()).toEqual([]);
  });

  it("entre rondas no se aceptan jugadas", () => {
    const s = session("AMBAS");
    anaClosesAfterLuisTurn(s);
    expect(s.drawFromStock("luis")).toEqual({ ok: false, reason: "No hay una ronda en juego" });
  });

  it("la siguiente ronda reparte de nuevo y rota quien empieza", () => {
    const s = session("AMBAS");
    anaClosesAfterLuisTurn(s);
    expect(s.startNextRound()).toEqual({ ok: true });
    expect(s.currentRoundNumber).toBe(2);
    expect(s.currentStatus).toBe("PLAYING");
    expect(s.currentRound.currentPlayerId).toBe("ana");
  });

  it("no se puede pasar a la siguiente ronda con una en juego", () => {
    expect(session().startNextRound()).toEqual({ ok: false, reason: "La ronda actual no ha terminado" });
  });

  it("en Clásica, el primer cierre termina la partida y publica PartidaFinalizada", () => {
    const s = session("CLASICA");
    expect(anaClosesAfterLuisTurn(s).valid).toBe(true);
    expect(s.currentStatus).toBe("FINISHED");
    expect(s.winnerId).toBe("ana");
    expect(s.pullEvents().map((e) => e.name)).toEqual(["RondaCerrada", "PartidaFinalizada"]);
  });

  it("rechaza un cierre que la modalidad no habilita, aunque sea válido", () => {
    const s = session("APUNTADO");
    expect(anaClosesAfterLuisTurn(s)).toMatchObject({ valid: false, reason: "La modalidad de cierre no está habilitada" });
    expect(s.currentStatus).toBe("PLAYING");
  });

  it("indica la carta tomada del pozo, que el jugador no puede descartar", () => {
    const s = session();
    s.drawFromDiscard("luis");
    expect(s.currentRound.cardTakenFromDiscard).toEqual(c("AC"));
  });
});
