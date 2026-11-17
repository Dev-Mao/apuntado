import { type Card, isJoker, order, sameRank, sameSuit } from "../entities/card.js";

export const MAX_JOKERS_PER_MELD = 1;

const allDistinct = (cards: readonly Card[]): boolean =>
  new Set(cards.map((c) => `${c.rank}${c.suit}`)).size === cards.length;

const naturalsOf = (cards: readonly Card[]): Card[] => cards.filter((c) => !isJoker(c));

const wellFormed = (cards: readonly Card[], size: number): boolean =>
  cards.length === size && allDistinct(cards) && cards.length - naturalsOf(cards).length <= MAX_JOKERS_PER_MELD;

const isGroupOf = (cards: readonly Card[], size: number): boolean => {
  if (!wellFormed(cards, size)) return false;
  const [first, ...rest] = naturalsOf(cards);
  return first !== undefined && rest.every((c) => sameRank(c, first));
};

const isRunOf = (cards: readonly Card[], size: number): boolean => {
  if (!wellFormed(cards, size)) return false;
  const naturals = naturalsOf(cards);
  const [first] = naturals;
  if (first === undefined || !naturals.every((c) => sameSuit(c, first))) return false;
  const orders = naturals.map(order);
  return Math.max(...orders) - Math.min(...orders) < size;
};

export const isSet = (cards: readonly Card[]): boolean => isGroupOf(cards, 3) || isRunOf(cards, 3);

export const isQuad = (cards: readonly Card[]): boolean => isGroupOf(cards, 4);

export const isRun = (cards: readonly Card[]): boolean => isRunOf(cards, 4);

export const isQuarta = (cards: readonly Card[]): boolean => isQuad(cards) || isRun(cards);

export const noCardReused = (melds: readonly (readonly Card[])[]): boolean => allDistinct(melds.flat());
