import { type Card, order, sameRank, sameSuit } from "../entities/card.js";

const allDistinct = (cards: readonly Card[]): boolean =>
  new Set(cards.map((c) => `${c.rank}${c.suit}`)).size === cards.length;

export const isSet = (cards: readonly Card[]): boolean => {
  if (cards.length !== 3 || !allDistinct(cards)) return false;
  const [first] = cards;
  if (first === undefined) return false;
  return cards.every((c) => sameRank(c, first));
};

export const isQuad = (cards: readonly Card[]): boolean => {
  if (cards.length !== 4 || !allDistinct(cards)) return false;
  const [first] = cards;
  if (first === undefined) return false;
  return cards.every((c) => sameRank(c, first));
};

export const isRun = (cards: readonly Card[]): boolean => {
  if (cards.length !== 4 || !allDistinct(cards)) return false;
  const [first] = cards;
  if (first === undefined) return false;
  if (!cards.every((c) => sameSuit(c, first))) return false;
  const ordered = [...cards].sort((a, b) => order(a) - order(b));
  return ordered.every((c, i) => i === 0 || order(c) === order(ordered[i - 1]!) + 1);
};

export const isQuarta = (cards: readonly Card[]): boolean => isQuad(cards) || isRun(cards);

export const noCardReused = (melds: readonly (readonly Card[])[]): boolean => {
  const all = melds.flat();
  return allDistinct(all);
};
