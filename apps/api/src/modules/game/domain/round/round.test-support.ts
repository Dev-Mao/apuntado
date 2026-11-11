import { type Card, type Rank, type Suit, card, cardId } from "../entities/card.js";
import { createDeck } from "../entities/deck.js";

export const cards = (codes: string): Card[] =>
  codes.split(" ").filter(Boolean).map((code) => card(code.slice(0, -1) as Rank, code.slice(-1) as Suit));

export const c = (code: string): Card => cards(code)[0]!;

export const riggedDeck = (hands: readonly string[], discardTop: string, nextDraws = ""): Card[] => {
  const fixed = [...hands.flatMap(cards), c(discardTop)];
  const draws = cards(nextDraws);
  const taken = new Set([...fixed, ...draws].map(cardId));
  const filler = createDeck().filter((x) => !taken.has(cardId(x)));
  return [...fixed, ...filler, ...draws.reverse()];
};
