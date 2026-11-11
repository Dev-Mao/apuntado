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

export const cardId = (c: Card): string => `${c.rank}${c.suit}`;

export const points = (c: Card): number => RANK_POINTS[c.rank];

export const order = (c: Card): number => RANK_ORDER[c.rank];

export const sameRank = (a: Card, b: Card): boolean => a.rank === b.rank;
export const sameSuit = (a: Card, b: Card): boolean => a.suit === b.suit;
