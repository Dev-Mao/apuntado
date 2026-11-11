import { type Card, type Rank, type Suit, card } from "../../domain/entities/card.js";
import type { RoomSettings } from "../../domain/room/room.types.js";
import type { ClosureDeclaration } from "../../domain/rules/game-rule.js";

const RANKS: readonly string[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS: readonly string[] = ["H", "D", "C", "S"];
const CLOSURES: readonly string[] = ["CLASICO", "APUNTADO"];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export const parseCard = (raw: unknown): Card | null => {
  if (!isRecord(raw) || typeof raw["rank"] !== "string" || typeof raw["suit"] !== "string") return null;
  if (!RANKS.includes(raw["rank"]) || !SUITS.includes(raw["suit"])) return null;
  return card(raw["rank"] as Rank, raw["suit"] as Suit);
};

const parseCards = (raw: unknown): Card[] | null => {
  if (!Array.isArray(raw)) return null;
  const cards = raw.map(parseCard);
  return cards.every((c): c is Card => c !== null) ? cards : null;
};

const parseMelds = (raw: unknown): Card[][] | null => {
  if (!Array.isArray(raw)) return null;
  const melds = raw.map(parseCards);
  return melds.every((m): m is Card[] => m !== null) ? melds : null;
};

export const parseDeclaration = (raw: unknown): ClosureDeclaration | null => {
  if (!isRecord(raw) || typeof raw["type"] !== "string" || !CLOSURES.includes(raw["type"])) return null;
  const melds = parseMelds(raw["melds"]);
  const leftovers = parseCards(raw["leftovers"]);
  const discard = raw["discard"] === null ? null : parseCard(raw["discard"]);
  if (!melds || !leftovers || (raw["discard"] !== null && !discard)) return null;
  return { type: raw["type"] as ClosureDeclaration["type"], melds, leftovers, discard };
};

export const parseSettings = (raw: unknown): RoomSettings | null => {
  if (!isRecord(raw) || typeof raw["mode"] !== "string") return null;
  const numbers = [raw["eliminationThreshold"], raw["turnSeconds"], raw["stake"]];
  if (!numbers.every((n) => typeof n === "number")) return null;
  return {
    mode: raw["mode"] as RoomSettings["mode"],
    eliminationThreshold: raw["eliminationThreshold"] as number,
    turnSeconds: raw["turnSeconds"] as number,
    stake: raw["stake"] as number,
  };
};

export const parseCode = (raw: unknown): string | null =>
  typeof raw === "string" && /^[A-Z0-9]{4}$/.test(raw.trim().toUpperCase()) ? raw.trim().toUpperCase() : null;
