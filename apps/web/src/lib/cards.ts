import type { CardDto, Rank, Suit } from "@apuntado/contracts";

export const SUIT_SYMBOL: Readonly<Record<Suit, string>> = {
  H: "♥",
  D: "♦",
  C: "♣",
  S: "♠",
};

export const RANK_ORDER: readonly Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const SUIT_ORDER: readonly Suit[] = ["H", "S", "D", "C"];
export const FACE_RANKS: readonly Rank[] = ["J", "Q", "K"];

export function isRedSuit(suit: Suit): boolean {
  return suit === "H" || suit === "D";
}

export function cardId(card: CardDto): string {
  return `${card.rank}${card.suit}`;
}

function compareBy(primary: (card: CardDto) => number, secondary: (card: CardDto) => number) {
  return (a: CardDto, b: CardDto) => primary(a) - primary(b) || secondary(a) - secondary(b);
}

const rankIndex = (card: CardDto) => RANK_ORDER.indexOf(card.rank);
const suitIndex = (card: CardDto) => SUIT_ORDER.indexOf(card.suit);

export function sortByRank(cards: readonly CardDto[]): CardDto[] {
  return [...cards].sort(compareBy(rankIndex, suitIndex));
}

export function sortBySuit(cards: readonly CardDto[]): CardDto[] {
  return [...cards].sort(compareBy(suitIndex, rankIndex));
}

export const CARD_BACK_SRC = "/cards/back.png";

export function cardImageSrc(card: CardDto): string {
  return `/cards/${cardId(card)}.png`;
}
