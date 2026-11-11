import { describe, expect, it } from "vitest";
import { cardId } from "../../domain/entities/card.js";
import { ApuntadoRule } from "../../domain/rules/apuntado-rule.js";
import { c, cards, riggedDeck } from "../../domain/round/round.test-support.js";
import { harness } from "../use-cases/use-cases.test-support.js";
import { projectPlayerView } from "./player-view-projector.js";

const NOW = new Date("2026-11-10T12:00:30Z");
const DECK = riggedDeck(["2C 3C 4C 6C 8C 10C JC QC 2D 3D", "7H 7S 7D 9H 9S 9D KH KS KD 5D"], "QS", "AC");

describe("Vista filtrada del jugador", () => {
  it("muestra la mano propia y de los rivales solo cuántas cartas tienen", () => {
    const { session } = harness(DECK);
    const view = projectPlayerView(session, "ana", NOW);
    expect(view.hand).toHaveLength(10);
    expect(view.opponents).toEqual([{ playerId: "luis", cardCount: 10 }]);
  });

  it("nunca incluye una carta de la mano ajena ni del mazo", () => {
    const { session } = harness(DECK);
    const serialized = JSON.stringify(projectPlayerView(session, "ana", NOW));
    const hidden = session.currentRound.handOf("luis").map(cardId);
    for (const id of hidden) {
      const [rank, suit] = [id.slice(0, -1), id.slice(-1)];
      expect(serialized).not.toContain(`{"rank":"${rank}","suit":"${suit}"}`);
    }
    expect(serialized).not.toContain(`{"rank":"A","suit":"C"}`);
  });

  it("indica la carta que no se puede descartar solo a quien tiene el turno", () => {
    const { session } = harness(DECK);
    session.drawFromDiscard("ana");
    expect(projectPlayerView(session, "ana", NOW).cannotDiscard).toEqual({ rank: "Q", suit: "S" });
    expect(projectPlayerView(session, "luis", NOW).cannotDiscard).toBeNull();
  });

  it("expone la hora límite del turno, el marcador y la modalidad", () => {
    const { session } = harness(DECK);
    const view = projectPlayerView(session, "ana", NOW);
    expect(view.turnDeadline).toBe(session.turnDeadline.toISOString());
    expect(view.mode).toBe("AMBAS");
    expect(view.enabledClosures).toEqual(["CLASICO", "APUNTADO"]);
    expect(view.scoreboard.map((l) => l.total)).toEqual([0, 0]);
    expect(view.serverTime).toBe(NOW.toISOString());
  });

  it("indica las acciones permitidas solo a quien tiene el turno, según la fase", () => {
    const { session } = harness(DECK);
    expect(projectPlayerView(session, "ana", NOW).allowedActions).toEqual(["DRAW_STOCK", "DRAW_DISCARD"]);
    expect(projectPlayerView(session, "luis", NOW).allowedActions).toEqual([]);
    session.drawFromStock("ana");
    expect(projectPlayerView(session, "ana", NOW).allowedActions).toEqual(["DISCARD", "DECLARE_CLOSURE"]);
  });

  it("entre rondas no muestra turno, fase ni hora límite, y sí el resultado de la ronda", () => {
    const { session } = harness(DECK);
    session.drawFromStock("ana");
    session.declareClosure("ana", {
      type: "APUNTADO", melds: [cards("7H 7S 7D"), cards("9H 9S 9D"), cards("KH KS KD")], leftovers: cards("AC"), discard: c("5D"),
    }, new ApuntadoRule());
    const view = projectPlayerView(session, "luis", NOW);
    expect(view).toMatchObject({ status: "ROUND_OVER", currentPlayerId: null, phase: null, turnDeadline: null, allowedActions: [] });
    expect(view.lastRound).toMatchObject({ roundNumber: 1, roundWinnerId: "ana", closureType: "APUNTADO" });
  });
});
