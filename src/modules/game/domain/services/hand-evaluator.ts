import { type Card, order, sameRank, sameSuit } from "../entities/card.js";

/**
 * EvaluadorDeMano — responsable exclusivo de verificar si un conjunto de cartas
 * cumple la estructura de una terna o de una cuarta.
 *
 * Acoplamiento eferente = 0: no depende de ningún otro componente, solo del
 * objeto de valor Carta. Por eso se prueba sin montar partida, red ni base de datos.
 */

const allDistinct = (cards: readonly Card[]): boolean =>
  new Set(cards.map((c) => `${c.rank}${c.suit}`)).size === cards.length;

/** Terna: tres cartas del mismo valor, sin importar el palo. */
export const isSet = (cards: readonly Card[]): boolean => {
  if (cards.length !== 3 || !allDistinct(cards)) return false;
  const [first] = cards;
  if (first === undefined) return false;
  return cards.every((c) => sameRank(c, first));
};

/** Cuarta por valor: las cuatro cartas de un mismo valor. */
export const isQuad = (cards: readonly Card[]): boolean => {
  if (cards.length !== 4 || !allDistinct(cards)) return false;
  const [first] = cards;
  if (first === undefined) return false;
  return cards.every((c) => sameRank(c, first));
};

/** Cuarta por secuencia: cuatro consecutivas del mismo palo, sin dar la vuelta. */
export const isRun = (cards: readonly Card[]): boolean => {
  if (cards.length !== 4 || !allDistinct(cards)) return false;
  const [first] = cards;
  if (first === undefined) return false;
  if (!cards.every((c) => sameSuit(c, first))) return false;
  const ordered = [...cards].sort((a, b) => order(a) - order(b));
  return ordered.every((c, i) => i === 0 || order(c) === order(ordered[i - 1]!) + 1);
};

/** Cuarta: por valor o por secuencia (enunciado del caso de estudio). */
export const isQuarta = (cards: readonly Card[]): boolean => isQuad(cards) || isRun(cards);

/** Ninguna carta puede participar en más de una combinación (RN-06). */
export const noCardReused = (melds: readonly (readonly Card[])[]): boolean => {
  const all = melds.flat();
  return allDistinct(all);
};
