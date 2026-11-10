import type { RandomSource } from "../../../../shared/random.js";
import { type Card, type Rank, type Suit, card } from "./card.js";

const SUITS: readonly Suit[] = ["H", "D", "C", "S"];
const RANKS: readonly Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export const DECK_SIZE = SUITS.length * RANKS.length;

export const createDeck = (): Card[] => SUITS.flatMap((suit) => RANKS.map((rank) => card(rank, suit)));

export const shuffle = (cards: readonly Card[], random: RandomSource): Card[] => {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random.next() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};
