import { describe, expect, it } from "vitest";
import { type Card, card, type Rank } from "../entities/card.js";
import { ApuntadoRule } from "./apuntado-rule.js";
import { ClassicRule } from "./classic-rule.js";
import type { ClosureDeclaration } from "./game-rule.js";

const trio = (rank: Rank): Card[] => [card(rank, "H"), card(rank, "S"), card(rank, "D")];
const quad = (rank: Rank): Card[] => [...trio(rank), card(rank, "C")];
const pair = (rank: Rank): Card[] => [card(rank, "H"), card(rank, "S")];

const classic = (melds: Card[][], leftovers: Card[] = [], discard: Card | null = card("2", "C")): ClosureDeclaration => ({
  type: "CLASICO",
  melds,
  leftovers,
  discard,
});

const apuntado = (melds: Card[][], leftovers: Card[]): ClosureDeclaration => ({
  type: "APUNTADO",
  melds,
  leftovers,
  discard: null,
});

describe("Casos borde de la regla Clásica (4-3-3)", () => {
  const rule = new ClassicRule();

  it("acepta una cuarta en escalera con dos ternas y un descarte", () => {
    const run = [card("4", "H"), card("5", "H"), card("6", "H"), card("7", "H")];
    expect(rule.validate(classic([run, trio("9"), trio("K")])).valid).toBe(true);
  });

  it("rechaza tres ternas sin cuarta", () => {
    expect(rule.validate(classic([trio("7"), trio("9"), trio("K")])).reason).toBe("Debe haber exactamente una cuarta");
  });

  it("rechaza dos cuartas y una terna", () => {
    expect(rule.validate(classic([quad("7"), quad("9"), trio("K")])).reason).toBe("Debe haber exactamente una cuarta");
  });

  it("rechaza una cuarta con una terna incompleta", () => {
    expect(rule.validate(classic([quad("7"), trio("9"), pair("K")])).reason).toBe("Debe haber exactamente dos ternas");
  });

  it("rechaza el cierre si quedan cartas sobrantes", () => {
    const result = rule.validate(classic([quad("7"), trio("9"), trio("K")], [card("A", "C")]));
    expect(result.reason).toBe("El cierre clásico no admite cartas sobrantes");
  });

  it("rechaza el cierre sin carta de descarte", () => {
    const result = rule.validate(classic([quad("7"), trio("9"), trio("K")], [], null));
    expect(result.reason).toBe("El cierre clásico requiere descartar una carta");
  });
});

describe("Casos borde de la regla Apuntado", () => {
  const rule = new ApuntadoRule();

  it("rechaza tres ternas incompletas", () => {
    const result = rule.validate(apuntado([pair("7"), pair("9"), pair("K")], [card("A", "C")]));
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Alguna de las combinaciones no es una terna");
  });

  it("rechaza dos ternas aunque las sobrantes sumen poco", () => {
    expect(rule.validate(apuntado([trio("7"), trio("9")], [card("A", "C")])).reason).toBe(
      "El apuntado requiere exactamente tres ternas",
    );
  });

  it("rechaza una cuarta en lugar de una terna", () => {
    expect(rule.validate(apuntado([quad("7"), trio("9"), trio("K")], [])).reason).toBe(
      "Alguna de las combinaciones no es una terna",
    );
  });

  it("rechaza sobrantes que suman exactamente 5 e informa la suma", () => {
    const result = rule.validate(apuntado([trio("7"), trio("9"), trio("K")], [card("2", "C"), card("3", "C")]));
    expect(result).toEqual({ valid: false, reason: "Las cartas sobrantes suman 5; deben sumar menos de 5", leftoverPoints: 5 });
  });

  it("acepta sobrantes que suman 4", () => {
    const result = rule.validate(apuntado([trio("7"), trio("9"), trio("K")], [card("A", "C"), card("3", "C")]));
    expect(result).toEqual({ valid: true, reason: null, leftoverPoints: 4 });
  });

  it("acepta tocar sin sobrantes", () => {
    expect(rule.validate(apuntado([trio("7"), trio("9"), trio("K")], [])).leftoverPoints).toBe(0);
  });

  it("una figura sobrante vale 10 y no deja tocar", () => {
    expect(rule.validate(apuntado([trio("7"), trio("9"), trio("Q")], [card("J", "C")])).leftoverPoints).toBe(10);
  });
});
