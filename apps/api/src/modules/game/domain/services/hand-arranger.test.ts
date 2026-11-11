import { describe, expect, it } from "vitest";
import { type Card, type Rank, type Suit, card, cardId } from "../entities/card.js";
import { bestArrangement } from "./hand-arranger.js";
import { pointsOf } from "./score-calculator.js";

const hand = (codes: string): Card[] =>
  codes.split(" ").map((code) => card(code.slice(0, -1) as Rank, code.slice(-1) as Suit));

const loosePoints = (codes: string) => pointsOf(bestArrangement(hand(codes)).loose);

describe("Mejor agrupación de una mano", () => {
  it("una mano sin combinaciones deja todas las cartas sueltas", () => {
    expect(loosePoints("AH 3S 5D 7C 9H JS KD 2C 4H 6S")).toBe(1 + 3 + 5 + 7 + 9 + 10 + 10 + 2 + 4 + 6);
  });

  it("aparta una terna y cobra solo el resto", () => {
    expect(loosePoints("KH KS KD 2C 3H")).toBe(5);
  });

  it("reconoce la cuarta por valor y la cuarta por secuencia", () => {
    expect(loosePoints("9H 9S 9D 9C 5H 6H 7H 8H AS")).toBe(1);
  });

  it("dos ternas que no se pisan se apartan las dos", () => {
    expect(loosePoints("QH QS QD 4C 4H 4S 2D")).toBe(2);
  });

  it("si una carta sirve a dos combinaciones, elige la que deja menos puntos sueltos", () => {
    expect(loosePoints("7H 7S 7D 8H 9H")).toBe(7 + 7);
    expect(loosePoints("2H 2S 2D 3H 4H")).toBe(2 + 2);
  });

  it("aparta una terna por valor y otra en escalera cuando no se pisan", () => {
    expect(loosePoints("7H 7S 7D 8H 9H 10H")).toBe(0);
    expect(loosePoints("KH KS KD QH JH 10H")).toBe(0);
  });

  it("una escalera de tres del mismo palo es una terna", () => {
    expect(loosePoints("5H 6H 7H")).toBe(0);
  });

  it("una escalera de tres con palos mezclados no es combinación", () => {
    expect(loosePoints("5H 6S 7H")).toBe(18);
  });

  it("no da la vuelta con el as: en J-Q-K-A solo combina J-Q-K y el as queda suelto", () => {
    expect(loosePoints("JS QS KS AS")).toBe(1);
    expect(loosePoints("QS KS AS")).toBe(21);
  });

  it("cada carta aparece una sola vez entre combinaciones y sueltas", () => {
    const cards = hand("7H 7S 7D 7C 8H 9H 10H JH 2S 2D 2C");
    const { melds, loose } = bestArrangement(cards);
    const all = [...melds.flat(), ...loose].map(cardId);
    expect(all).toHaveLength(cards.length);
    expect(new Set(all).size).toBe(cards.length);
  });
});
