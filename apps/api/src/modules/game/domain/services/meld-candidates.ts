import { type Card, order } from "../entities/card.js";

export const combinationsOf = (cards: readonly Card[], size: number): Card[][] => {
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

const runsOf = (suited: readonly Card[], size: number): Card[][] => {
  const sorted = [...suited].sort((a, b) => order(a) - order(b));
  return sorted
    .map((_, i) => sorted.slice(i, i + size))
    .filter((w) => w.length === size && w.every((c, k) => k === 0 || order(c) === order(w[k - 1]!) + 1));
};

const runCandidates = (cards: readonly Card[], size: number): Card[][] =>
  groupBy(cards, (c) => c.suit).flatMap((suited) => runsOf(suited, size));

export const setCandidates = (cards: readonly Card[]): Card[][] => [
  ...groupBy(cards, (c) => c.rank).flatMap((group) => combinationsOf(group, 3)),
  ...runCandidates(cards, 3),
];

export const quartaCandidates = (cards: readonly Card[]): Card[][] => [
  ...groupBy(cards, (c) => c.rank).filter((group) => group.length === 4),
  ...runCandidates(cards, 4),
];
