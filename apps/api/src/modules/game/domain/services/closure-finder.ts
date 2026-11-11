import { type Card, cardId } from "../entities/card.js";
import { LEFTOVER_LIMIT } from "../rules/apuntado-rule.js";
import type { ClosureDeclaration, ClosureType } from "../rules/game-rule.js";
import { quartaCandidates, setCandidates } from "./meld-candidates.js";
import { pointsOf } from "./score-calculator.js";

const CLOSING_HAND_SIZE = 11;

const without = (cards: readonly Card[], removed: readonly Card[]): Card[] => {
  const ids = new Set(removed.map(cardId));
  return cards.filter((c) => !ids.has(cardId(c)));
};

const disjoint = (melds: readonly (readonly Card[])[]): boolean => {
  const ids = melds.flat().map(cardId);
  return new Set(ids).size === ids.length;
};

const canDiscard = (card: Card, forbidden: Card | null): boolean => !forbidden || cardId(card) !== cardId(forbidden);

const twoSetsCovering = (cards: readonly Card[]): Card[][] | null => {
  const sets = setCandidates(cards);
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      const pair = [sets[i]!, sets[j]!];
      if (disjoint(pair) && pair.flat().length === cards.length) return pair;
    }
  }
  return null;
};

const classicWithDiscard = (hand: readonly Card[], discard: Card): ClosureDeclaration | null => {
  const rest = without(hand, [discard]);
  for (const quarta of quartaCandidates(rest)) {
    const sets = twoSetsCovering(without(rest, quarta));
    if (sets) return { type: "CLASICO", melds: [quarta, ...sets], leftovers: [], discard };
  }
  return null;
};

const findClassic = (hand: readonly Card[], forbidden: Card | null): ClosureDeclaration | null => {
  for (const discard of hand) {
    if (!canDiscard(discard, forbidden)) continue;
    const found = classicWithDiscard(hand, discard);
    if (found) return found;
  }
  return null;
};

const apuntadoWith = (melds: Card[][], leftovers: readonly Card[], forbidden: Card | null): ClosureDeclaration | null => {
  if (pointsOf(leftovers) < LEFTOVER_LIMIT) return { type: "APUNTADO", melds, leftovers, discard: null };
  for (const discard of leftovers) {
    const kept = without(leftovers, [discard]);
    if (canDiscard(discard, forbidden) && pointsOf(kept) < LEFTOVER_LIMIT) {
      return { type: "APUNTADO", melds, leftovers: kept, discard };
    }
  }
  return null;
};

const threeSetCombinations = (sets: readonly Card[][]): Card[][][] => {
  const result: Card[][][] = [];
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      for (let k = j + 1; k < sets.length; k++) result.push([sets[i]!, sets[j]!, sets[k]!]);
    }
  }
  return result.filter(disjoint);
};

const findApuntado = (hand: readonly Card[], forbidden: Card | null): ClosureDeclaration | null => {
  for (const melds of threeSetCombinations(setCandidates(hand))) {
    const found = apuntadoWith(melds, without(hand, melds.flat()), forbidden);
    if (found) return found;
  }
  return null;
};

export const findClosure = (
  hand: readonly Card[],
  enabled: readonly ClosureType[],
  forbiddenDiscard: Card | null,
): ClosureDeclaration | null => {
  if (hand.length !== CLOSING_HAND_SIZE) return null;
  const classic = enabled.includes("CLASICO") ? findClassic(hand, forbiddenDiscard) : null;
  if (classic) return classic;
  return enabled.includes("APUNTADO") ? findApuntado(hand, forbiddenDiscard) : null;
};
