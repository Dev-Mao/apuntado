/** Objeto de valor inmutable. Una baraja de 52 cartas: no hay dos cartas iguales. */
export type Suit = "H" | "D" | "C" | "S";
export type Rank =
  | "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

const RANK_ORDER: Record<Rank, number> = {
  A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
  "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13,
};

const RANK_POINTS: Record<Rank, number> = {
  A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
  "8": 8, "9": 9, "10": 10, J: 10, Q: 10, K: 10,
};

export interface Card {
  readonly rank: Rank;
  readonly suit: Suit;
}

export const card = (rank: Rank, suit: Suit): Card => ({ rank, suit });

/** Identidad de la carta. Con una sola baraja, valor + palo la determinan. */
export const cardId = (c: Card): string => `${c.rank}${c.suit}`;

/** As = 1, figuras = 10, numeradas por su valor (Pagat, rummy estándar). */
export const points = (c: Card): number => RANK_POINTS[c.rank];

/** El as es bajo: A-2-3-4 es válida, J-Q-K-A no. La secuencia no da la vuelta. */
export const order = (c: Card): number => RANK_ORDER[c.rank];

export const sameRank = (a: Card, b: Card): boolean => a.rank === b.rank;
export const sameSuit = (a: Card, b: Card): boolean => a.suit === b.suit;
