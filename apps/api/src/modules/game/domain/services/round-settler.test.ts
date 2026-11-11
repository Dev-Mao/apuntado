import { describe, expect, it } from "vitest";
import { SeededRandom } from "../../../../shared/random.js";
import { ClassicRule } from "../rules/classic-rule.js";
import { Round } from "../round/round.js";
import { c, cards, riggedDeck } from "../round/round.test-support.js";
import { settleRound } from "./round-settler.js";

const random = new SeededRandom(5);

describe("Liquidación de la ronda", () => {
  const deck = riggedDeck(["7H 7S 7D 7C KH KS KD 4C 4D 4H", "QC QD QS 2C 3C 5C 6C 8C 9C JD"], "AC", "9S");

  it("el ganador suma 0 y el perdedor solo sus cartas no combinadas", () => {
    const round = Round.start(["ana", "luis"], deck, 0, random);
    round.drawFromStock("ana");
    round.declareClosure("ana", {
      type: "CLASICO", melds: [cards("7H 7S 7D 7C"), cards("KH KS KD"), cards("4C 4D 4H")], leftovers: [], discard: c("9S"),
    }, new ClassicRule());
    expect(settleRound(round)).toEqual([
      { playerId: "ana", points: 0 },
      { playerId: "luis", points: 2 + 3 + 5 + 6 + 8 + 9 + 10 },
    ]);
  });

  it("no liquida una ronda en curso", () => {
    expect(() => settleRound(Round.start(["ana", "luis"], deck, 0, random))).toThrow();
  });
});
