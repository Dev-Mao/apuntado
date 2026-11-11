import { describe, expect, it } from "vitest";
import { c, riggedDeck } from "../../domain/round/round.test-support.js";
import { harness } from "../use-cases/use-cases.test-support.js";
import { projectPlayerView } from "../views/player-view-projector.js";
import { SimpleBotStrategy } from "./simple-bot-strategy.js";

const LUIS = "2C 3C 4C 6C 8C 10C JC QC 2D 3D";
const bot = new SimpleBotStrategy();

describe("Estrategia simple del oponente virtual", () => {
  it("no hace nada si no es su turno", () => {
    const { session } = harness(riggedDeck([LUIS, "7H 7S 7D 9H 9S 9D KH KS KD 5D"], "QS"));
    expect(bot.decide(projectPlayerView(session, "luis"))).toBeNull();
  });

  it("toma del pozo la carta que completa una combinación", () => {
    const { session } = harness(riggedDeck([LUIS, "7H 7S AD 9H 9S 9D KH KS KD 5D"], "7D"));
    expect(bot.decide(projectPlayerView(session, "ana"))).toEqual({ kind: "DRAW", source: "DISCARD" });
  });

  it("roba del mazo si la carta del pozo no le sirve", () => {
    const { session } = harness(riggedDeck([LUIS, "7H 7S AD 9H 9S 9D KH KS KD 5D"], "QS"));
    expect(bot.decide(projectPlayerView(session, "ana"))).toEqual({ kind: "DRAW", source: "STOCK" });
  });

  it("declara el cierre apenas la mano lo permite", () => {
    const { session } = harness(riggedDeck([LUIS, "7H 7S 7D 9H 9S 9D KH KS KD 5D"], "QS", "AC"));
    session.drawFromStock("ana");
    const action = bot.decide(projectPlayerView(session, "ana"));
    expect(action?.kind).toBe("DECLARE");
  });

  it("si no puede cerrar, descarta su carta suelta de mayor valor", () => {
    const { session } = harness(riggedDeck([LUIS, "7H 7S 7D 9H 9S AD KH KS KD 5D"], "QS", "2H"));
    session.drawFromStock("ana");
    expect(bot.decide(projectPlayerView(session, "ana"))).toEqual({ kind: "DISCARD", card: c("9H") });
  });

  it("nunca descarta la carta que acaba de tomar del pozo", () => {
    const { session } = harness(riggedDeck([LUIS, "AH 2S 3H 4H 5S 6D 7H 8S 9D 10H"], "KS"));
    session.drawFromDiscard("ana");
    const action = bot.decide(projectPlayerView(session, "ana"));
    expect(action).toEqual({ kind: "DISCARD", card: c("10H") });
  });
});
