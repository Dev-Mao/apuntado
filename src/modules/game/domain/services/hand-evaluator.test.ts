import { describe, expect, it } from "vitest";
import { card } from "../entities/card.js";
import { isQuad, isQuarta, isRun, isSet, noCardReused } from "./hand-evaluator.js";

describe("EvaluadorDeMano · terna", () => {
  it("acepta tres cartas del mismo valor", () => {
    expect(isSet([card("7", "H"), card("7", "S"), card("7", "D")])).toBe(true);
  });

  it("rechaza tres cartas de valores distintos", () => {
    expect(isSet([card("7", "H"), card("8", "S"), card("7", "D")])).toBe(false);
  });

  it("rechaza una secuencia: una terna nunca es escalera", () => {
    expect(isSet([card("5", "H"), card("6", "H"), card("7", "H")])).toBe(false);
  });

  it("rechaza un conjunto que no tenga exactamente tres cartas", () => {
    expect(isSet([card("7", "H"), card("7", "S")])).toBe(false);
    expect(isSet([card("7", "H"), card("7", "S"), card("7", "D"), card("7", "C")])).toBe(false);
  });
});

describe("EvaluadorDeMano · cuarta", () => {
  it("acepta las cuatro cartas de un mismo valor", () => {
    expect(isQuad([card("9", "H"), card("9", "S"), card("9", "D"), card("9", "C")])).toBe(true);
  });

  it("acepta cuatro consecutivas del mismo palo", () => {
    expect(isRun([card("5", "H"), card("6", "H"), card("7", "H"), card("8", "H")])).toBe(true);
  });

  it("acepta la secuencia aunque llegue desordenada", () => {
    expect(isRun([card("8", "H"), card("5", "H"), card("7", "H"), card("6", "H")])).toBe(true);
  });

  it("rechaza una secuencia de palos mezclados", () => {
    expect(isRun([card("5", "H"), card("6", "S"), card("7", "D"), card("8", "C")])).toBe(false);
  });

  it("acepta el as como carta baja", () => {
    expect(isRun([card("A", "D"), card("2", "D"), card("3", "D"), card("4", "D")])).toBe(true);
  });

  it("rechaza J-Q-K-A: el as es bajo y la secuencia no da la vuelta", () => {
    expect(isRun([card("J", "S"), card("Q", "S"), card("K", "S"), card("A", "S")])).toBe(false);
  });

  it("reconoce la cuarta en sus dos formas", () => {
    expect(isQuarta([card("9", "H"), card("9", "S"), card("9", "D"), card("9", "C")])).toBe(true);
    expect(isQuarta([card("5", "H"), card("6", "H"), card("7", "H"), card("8", "H")])).toBe(true);
    expect(isQuarta([card("5", "H"), card("6", "H"), card("8", "H"), card("9", "H")])).toBe(false);
  });
});

describe("EvaluadorDeMano · una carta pertenece a una sola combinación", () => {
  it("detecta la carta repetida entre combinaciones", () => {
    const shared = card("7", "H");
    const melds = [
      [shared, card("7", "S"), card("7", "D")],
      [shared, card("8", "S"), card("8", "D")],
    ];
    expect(noCardReused(melds)).toBe(false);
  });

  it("acepta combinaciones sin cartas compartidas", () => {
    const melds = [
      [card("7", "H"), card("7", "S"), card("7", "D")],
      [card("8", "H"), card("8", "S"), card("8", "D")],
    ];
    expect(noCardReused(melds)).toBe(true);
  });
});
