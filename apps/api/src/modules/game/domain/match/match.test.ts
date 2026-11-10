import { describe, expect, it } from "vitest";
import { type GameMode, Match } from "./match.js";

const scores = (points: Record<string, number>) => Object.entries(points).map(([playerId, p]) => ({ playerId, points: p }));
const match = (mode: GameMode, players = ["ana", "luis", "eva"], threshold = 101) =>
  Match.create(players, { mode, eliminationThreshold: threshold });

describe("Partida · modalidades", () => {
  it.each([
    ["CLASICA", ["CLASICO"]],
    ["APUNTADO", ["APUNTADO"]],
    ["AMBAS", ["CLASICO", "APUNTADO"]],
  ] as const)("la modalidad %s habilita los cierres %j", (mode, closures) => {
    expect(match(mode).enabledClosures).toEqual(closures);
  });
});

describe("Partida · Clásica", () => {
  it("se juega una sola ronda y gana quien cerró", () => {
    const m = match("CLASICA");
    m.recordRound(scores({ ana: 0, luis: 30, eva: 12 }), "ana");
    expect(m.currentStatus).toBe("FINISHED");
    expect(m.winnerId).toBe("ana");
  });

  it("si nadie cerró, gana quien suma menos puntos", () => {
    const m = match("CLASICA");
    m.recordRound(scores({ ana: 40, luis: 18, eva: 25 }), null);
    expect(m.winnerId).toBe("luis");
  });
});

describe("Partida · Apuntado a 101", () => {
  it("acumula los puntos de ronda en ronda", () => {
    const m = match("APUNTADO");
    m.recordRound(scores({ ana: 0, luis: 30, eva: 12 }), "ana");
    m.recordRound(scores({ ana: 7, luis: 0, eva: 20 }), "luis");
    expect([m.totalOf("ana"), m.totalOf("luis"), m.totalOf("eva")]).toEqual([7, 30, 32]);
    expect(m.currentStatus).toBe("PLAYING");
  });

  it("con 100 puntos sigue jugando y con exactamente 101 queda eliminado", () => {
    const m = match("APUNTADO");
    m.recordRound(scores({ ana: 0, luis: 100, eva: 101 }), "ana");
    expect(m.isEliminated("luis")).toBe(false);
    expect(m.isEliminated("eva")).toBe(true);
    expect(m.activePlayerIds).toEqual(["ana", "luis"]);
  });

  it("si varios cruzan el umbral en la misma ronda, todos quedan eliminados", () => {
    const m = match("APUNTADO", ["ana", "luis", "eva", "leo"]);
    m.recordRound(scores({ ana: 0, luis: 110, eva: 105, leo: 20 }), "ana");
    expect(m.activePlayerIds).toEqual(["ana", "leo"]);
  });

  it("termina cuando queda un solo jugador, que es el ganador", () => {
    const m = match("APUNTADO", ["ana", "luis"]);
    m.recordRound(scores({ ana: 0, luis: 120 }), "ana");
    expect(m.currentStatus).toBe("FINISHED");
    expect(m.winnerId).toBe("ana");
  });

  it("si los últimos cruzan juntos el umbral, gana el de menor puntaje", () => {
    const m = match("APUNTADO", ["ana", "luis"]);
    m.recordRound(scores({ ana: 95, luis: 90 }), null);
    m.recordRound(scores({ ana: 10, luis: 30 }), null);
    expect(m.winnerId).toBe("ana");
  });

  it("ante empate en el puntaje, gana quien haya ganado más rondas", () => {
    const m = match("APUNTADO", ["ana", "luis"]);
    m.recordRound(scores({ ana: 50, luis: 0 }), "luis");
    m.recordRound(scores({ ana: 60, luis: 110 }), null);
    expect(m.winnerId).toBe("luis");
  });

  it("los eliminados ya no suman ni juegan las rondas siguientes", () => {
    const m = match("APUNTADO");
    m.recordRound(scores({ ana: 0, luis: 30, eva: 130 }), "ana");
    m.recordRound(scores({ ana: 10, luis: 0 }), "luis");
    expect(m.totalOf("eva")).toBe(130);
    expect(m.activePlayerIds).toEqual(["ana", "luis"]);
  });

  it("el umbral es configurable", () => {
    const m = match("APUNTADO", ["ana", "luis"], 30);
    m.recordRound(scores({ ana: 0, luis: 30 }), "ana");
    expect(m.winnerId).toBe("ana");
  });

  it("no acepta rondas después de terminada", () => {
    const m = match("CLASICA");
    m.recordRound(scores({ ana: 0, luis: 5, eva: 5 }), "ana");
    expect(() => m.recordRound(scores({ ana: 0, luis: 5, eva: 5 }), "ana")).toThrow();
  });
});

describe("Partida · repartidor y primer turno", () => {
  it("empieza el jugador a la izquierda del repartidor, que rota cada ronda", () => {
    const m = match("APUNTADO", ["ana", "luis", "eva"]);
    expect(m.activePlayerIds[m.firstTurnIndex]).toBe("luis");
    m.recordRound(scores({ ana: 0, luis: 5, eva: 5 }), "ana");
    expect(m.activePlayerIds[m.firstTurnIndex]).toBe("eva");
    m.recordRound(scores({ ana: 5, luis: 0, eva: 5 }), "luis");
    expect(m.activePlayerIds[m.firstTurnIndex]).toBe("ana");
  });

  it("salta a los jugadores eliminados", () => {
    const m = match("APUNTADO", ["ana", "luis", "eva"]);
    m.recordRound(scores({ ana: 0, luis: 5, eva: 120 }), "ana");
    expect(m.activePlayerIds[m.firstTurnIndex]).toBe("ana");
  });
});
