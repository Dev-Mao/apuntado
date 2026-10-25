import { type Card, points } from "../entities/card.js";

/**
 * CalculadorDePuntaje — responsable exclusivo de traducir un conjunto de cartas
 * a su valor numérico. Acoplamiento eferente = 0.
 */
export const pointsOf = (cards: readonly Card[]): number =>
  cards.reduce((total, c) => total + points(c), 0);

/** El ganador de la ronda suma 0; los demás, solo sus cartas no combinadas (RN-11). */
export const roundPenalty = (unmatched: readonly Card[], multiplier = 1): number =>
  pointsOf(unmatched) * multiplier;
