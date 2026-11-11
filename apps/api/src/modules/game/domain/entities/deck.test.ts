import { describe, expect, it } from "vitest";
import { SeededRandom } from "../../../../shared/random.js";
import { cardId } from "./card.js";
import { DECK_SIZE, createDeck, shuffle } from "./deck.js";

const ids = (cards: readonly { rank: string; suit: string }[]) => cards.map((c) => `${c.rank}${c.suit}`);

describe("Baraja", () => {
  it("tiene 52 cartas distintas", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(DECK_SIZE);
    expect(new Set(deck.map(cardId)).size).toBe(52);
  });

  it("al barajar conserva exactamente las mismas cartas", () => {
    const deck = createDeck();
    const shuffled = shuffle(deck, new SeededRandom(7));
    expect([...ids(shuffled)].sort()).toEqual([...ids(deck)].sort());
  });

  it("con la misma semilla produce el mismo orden", () => {
    expect(ids(shuffle(createDeck(), new SeededRandom(42)))).toEqual(ids(shuffle(createDeck(), new SeededRandom(42))));
  });

  it("con semillas distintas produce órdenes distintos", () => {
    expect(ids(shuffle(createDeck(), new SeededRandom(1)))).not.toEqual(ids(shuffle(createDeck(), new SeededRandom(2))));
  });

  it("no modifica la baraja que recibe", () => {
    const deck = createDeck();
    const before = ids(deck);
    shuffle(deck, new SeededRandom(3));
    expect(ids(deck)).toEqual(before);
  });
});
