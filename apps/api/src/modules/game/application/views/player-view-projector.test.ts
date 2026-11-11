import { describe, expect, it } from "vitest";
import { cardId } from "../../domain/entities/card.js";
import { riggedDeck } from "../../domain/round/round.test-support.js";
import { harness } from "../use-cases/use-cases.test-support.js";
import { projectPlayerView } from "./player-view-projector.js";

const DECK = riggedDeck(["2C 3C 4C 6C 8C 10C JC QC 2D 3D", "7H 7S 7D 9H 9S 9D KH KS KD 5D"], "QS", "AC");

describe("Vista filtrada del jugador", () => {
  it("muestra la mano propia y de los rivales solo cuántas cartas tienen", () => {
    const { session } = harness(DECK);
    const view = projectPlayerView(session, "ana");
    expect(view.hand).toHaveLength(10);
    expect(view.opponents).toEqual([{ playerId: "luis", cardCount: 10 }]);
  });

  it("nunca incluye una carta de la mano ajena ni del mazo", () => {
    const { session } = harness(DECK);
    const serialized = JSON.stringify(projectPlayerView(session, "ana"));
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
    expect(projectPlayerView(session, "ana").cannotDiscard).toEqual({ rank: "Q", suit: "S" });
    expect(projectPlayerView(session, "luis").cannotDiscard).toBeNull();
  });

  it("expone la hora límite del turno, el marcador y la modalidad", () => {
    const { session } = harness(DECK);
    const view = projectPlayerView(session, "ana");
    expect(view.turnDeadline).toBe(session.turnDeadline.toISOString());
    expect(view.mode).toBe("AMBAS");
    expect(view.enabledClosures).toEqual(["CLASICO", "APUNTADO"]);
    expect(view.scoreboard.map((l) => l.total)).toEqual([0, 0]);
  });
});
