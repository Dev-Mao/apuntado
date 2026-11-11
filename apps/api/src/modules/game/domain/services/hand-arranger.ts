import { type Card, cardId } from "../entities/card.js";
import { quartaCandidates, setCandidates } from "./meld-candidates.js";
import { pointsOf } from "./score-calculator.js";

export interface Arrangement {
  readonly melds: readonly (readonly Card[])[];
  readonly loose: readonly Card[];
}

const candidateMelds = (hand: readonly Card[]): Card[][] => [...setCandidates(hand), ...quartaCandidates(hand)];

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
