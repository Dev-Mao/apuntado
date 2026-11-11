import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { SeededRandom } from "../../../../shared/random.js";
import { cardId } from "../entities/card.js";
import { DECK_SIZE, createDeck, shuffle } from "../entities/deck.js";
import { HAND_SIZE, Round } from "./round.js";

type Move = { kind: "stock" | "pile" | "timeout" } | { kind: "discard"; pick: number };

const moveArb: fc.Arbitrary<Move> = fc.oneof(
  fc.constantFrom<Move>({ kind: "stock" }, { kind: "pile" }, { kind: "timeout" }),
  fc.nat(10).map((pick): Move => ({ kind: "discard", pick })),
);

const apply = (round: Round, move: Move): void => {
  const player = round.currentPlayerId;
  if (move.kind === "stock") round.drawFromStock(player);
  if (move.kind === "pile") round.drawFromDiscard(player);
  if (move.kind === "timeout") round.timeOut(player);
  if (move.kind === "discard") {
    const hand = round.handOf(player);
    round.discard(player, hand[move.pick % hand.length]!);
  }
};

const totalCards = (round: Round): number =>
  round.playerIds.reduce((sum, id) => sum + round.handOf(id).length, round.stockSize + round.discardSize);

describe("Ronda · invariantes del reglamento (§13)", () => {
  it("la baraja se conserva y las cartas fuera de las manos son constantes en cualquier secuencia de jugadas", () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 4 }), fc.nat(), fc.array(moveArb, { minLength: 200, maxLength: 600 }), (players, seed, moves) => {
        const random = new SeededRandom(seed);
        const ids = Array.from({ length: players }, (_, i) => `j${i}`);
        const round = Round.start(ids, shuffle(createDeck(), random), 0, random);
        for (const move of moves) {
          apply(round, move);
          expect(totalCards(round)).toBe(DECK_SIZE);
          const inHands = round.playerIds.flatMap((id) => round.handOf(id).map(cardId));
          expect(new Set(inHands).size).toBe(inHands.length);
          if (round.currentPhase === "DRAW") {
            expect(round.stockSize + round.discardSize).toBe(DECK_SIZE - HAND_SIZE * players);
          }
        }
      }),
      { numRuns: 300 },
    );
  });
});
