import { type Card, points } from "../entities/card.js";

export const pointsOf = (cards: readonly Card[]): number =>
  cards.reduce((total, c) => total + points(c), 0);

export const roundPenalty = (unmatched: readonly Card[], multiplier = 1): number =>
  pointsOf(unmatched) * multiplier;
