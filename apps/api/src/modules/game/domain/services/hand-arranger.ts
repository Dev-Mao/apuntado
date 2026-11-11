import { type Card, cardId, order } from "../entities/card.js";
import { pointsOf } from "./score-calculator.js";

export interface Arrangement {
  readonly melds: readonly (readonly Card[])[];
  readonly loose: readonly Card[];
}

const combinationsOf = (cards: readonly Card[], size: number): Card[][] => {
  if (size === 0) return [[]];
  return cards.flatMap((first, i) =>
    combinationsOf(cards.slice(i + 1), size - 1).map((rest) => [first, ...rest]),
  );
};

const groupBy = (cards: readonly Card[], key: (c: Card) => string): Card[][] => {
  const groups = new Map<string, Card[]>();
  for (const c of cards) groups.set(key(c), [...(groups.get(key(c)) ?? []), c]);
  return [...groups.values()];
};

const sameRankMelds = (cards: readonly Card[]): Card[][] =>
  groupBy(cards, (c) => c.rank).flatMap((group) => [
    ...combinationsOf(group, 3),
    ...(group.length === 4 ? [group] : []),
  ]);

const runsOf = (suited: readonly Card[]): Card[][] => {
  const sorted = [...suited].sort((a, b) => order(a) - order(b));
  return sorted
    .map((_, i) => sorted.slice(i, i + 4))
    .filter((w) => w.length === 4 && w.every((c, k) => k === 0 || order(c) === order(w[k - 1]!) + 1));
};

const candidateMelds = (hand: readonly Card[]): Card[][] => [
  ...sameRankMelds(hand),
  ...groupBy(hand, (c) => c.suit).flatMap(runsOf),
];

interface Search {
  readonly candidates: readonly Card[][];
  best: { melds: Card[][]; covered: number };
}

const explore = (search: Search, from: number, used: Set<string>, chosen: Card[][], covered: number): void => {
  if (covered > search.best.covered) search.best = { melds: [...chosen], covered };
  for (let i = from; i < search.candidates.length; i++) {
    const meld = search.candidates[i]!;
    if (meld.some((c) => used.has(cardId(c)))) continue;
    meld.forEach((c) => used.add(cardId(c)));
    explore(search, i + 1, used, [...chosen, meld], covered + pointsOf(meld));
    meld.forEach((c) => used.delete(cardId(c)));
  }
};

export const bestArrangement = (hand: readonly Card[]): Arrangement => {
  const search: Search = { candidates: candidateMelds(hand), best: { melds: [], covered: 0 } };
  explore(search, 0, new Set(), [], 0);
  const inMelds = new Set(search.best.melds.flat().map(cardId));
  return { melds: search.best.melds, loose: hand.filter((c) => !inMelds.has(cardId(c))) };
};
