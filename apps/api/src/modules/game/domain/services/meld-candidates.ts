import { type Card, isJoker, order } from "../entities/card.js";
import { isQuarta, isSet } from "./hand-evaluator.js";

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

const withJoker = (cards: readonly Card[], size: number, isMeld: (meld: readonly Card[]) => boolean): Card[][] => {
  const naturals = cards.filter((c) => !isJoker(c));
  return cards
    .filter(isJoker)
    .flatMap((joker) => combinationsOf(naturals, size - 1).map((rest) => [...rest, joker]))
    .filter(isMeld);
};

export const setCandidates = (cards: readonly Card[]): Card[][] => {
  const naturals = cards.filter((c) => !isJoker(c));
  return [
    ...groupBy(naturals, (c) => c.rank).flatMap((group) => combinationsOf(group, 3)),
    ...runCandidates(naturals, 3),
    ...withJoker(cards, 3, isSet),
  ];
};

export const quartaCandidates = (cards: readonly Card[]): Card[][] => {
  const naturals = cards.filter((c) => !isJoker(c));
  return [
    ...groupBy(naturals, (c) => c.rank).filter((group) => group.length === 4),
    ...runCandidates(naturals, 4),
    ...withJoker(cards, 4, isQuarta),
  ];
};
