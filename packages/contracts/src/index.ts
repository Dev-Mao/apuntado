export type Suit = "H" | "D" | "C" | "S";

export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface CardDto {
  readonly rank: Rank;
  readonly suit: Suit;
}

export type GameMode = "CLASICA" | "APUNTADO" | "AMBAS";

export type ClosureType = "CLASICO" | "APUNTADO";
