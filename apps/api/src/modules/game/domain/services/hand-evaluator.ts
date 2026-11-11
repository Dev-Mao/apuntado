import { type Card, order, sameRank, sameSuit } from "../entities/card.js";

const allDistinct = (cards: readonly Card[]): boolean =>
  new Set(cards.map((c) => `${c.rank}${c.suit}`)).size === cards.length;

const isGroupOf = (cards: readonly Card[], size: number): boolean => {
  const [first] = cards;
  return cards.length === size && first !== undefined && allDistinct(cards) && cards.every((c) => sameRank(c, first));
};

const isRunOf = (cards: readonly Card[], size: number): boolean => {
  const [first] = cards;
  if (cards.length !== size || first === undefined || !allDistinct(cards)) return false;
  if (!cards.every((c) => sameSuit(c, first))) return false;
  const ordered = [...cards].sort((a, b) => order(a) - order(b));
  return ordered.every((c, i) => i === 0 || order(c) === order(ordered[i - 1]!) + 1);
};

export const isSet = (cards: readonly Card[]): boolean => isGroupOf(cards, 3) || isRunOf(cards, 3);

export const isQuad = (cards: readonly Card[]): boolean => isGroupOf(cards, 4);

export const isRun = (cards: readonly Card[]): boolean => isRunOf(cards, 4);

export const isQuarta = (cards: readonly Card[]): boolean => isQuad(cards) || isRun(cards);

export const noCardReused = (melds: readonly (readonly Card[])[]): boolean => allDistinct(melds.flat());
