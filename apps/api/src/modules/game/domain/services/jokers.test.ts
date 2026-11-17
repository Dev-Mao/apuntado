import { describe, expect, it } from "vitest";
import { cardId, points } from "../entities/card.js";
import { ApuntadoRule } from "../rules/apuntado-rule.js";
import { ClassicRule } from "../rules/classic-rule.js";
import { c, cards } from "../round/round.test-support.js";
import { findClosure } from "./closure-finder.js";
import { bestArrangement } from "./hand-arranger.js";
import { isQuad, isRun, isSet } from "./hand-evaluator.js";
import { quartaCandidates, setCandidates } from "./meld-candidates.js";

const ids = (melds: readonly (readonly { rank: string; suit: string }[])[]) =>
  melds.map((meld) => meld.map((x) => `${x.rank}${x.suit}`).sort().join(" ")).sort();

describe("Comodín · valor", () => {
  it("suelto en la mano vale 25 puntos", () => {
    expect(points(c("XH"))).toBe(25);
    expect(points(c("XS"))).toBe(25);
  });
});

describe("Comodín · combinaciones válidas", () => {
  it("completa una terna del mismo valor", () => {
    expect(isSet(cards("7H 7S XH"))).toBe(true);
  });

  it("llena el hueco de una escalera de tres o la extiende por un extremo", () => {
    expect(isSet(cards("5H 7H XS"))).toBe(true);
    expect(isSet(cards("5H 6H XS"))).toBe(true);
    expect(isSet(cards("QD KD XH"))).toBe(true);
    expect(isSet(cards("AS 2S XH"))).toBe(true);
  });

  it("completa una cuarta del mismo valor y una escalera de cuatro", () => {
    expect(isQuad(cards("9H 9S 9D XS"))).toBe(true);
    expect(isRun(cards("4C 5C 7C XH"))).toBe(true);
    expect(isRun(cards("4C 6C 7C XH"))).toBe(true);
  });

  it("no salva una escalera con un hueco más grande que un comodín", () => {
    expect(isSet(cards("5H 8H XS"))).toBe(false);
    expect(isRun(cards("4C 5C 8C XH"))).toBe(false);
  });

  it("no mezcla palos ni valores distintos", () => {
    expect(isSet(cards("7H 8S XH"))).toBe(false);
    expect(isQuad(cards("9H 9S 8D XS"))).toBe(false);
  });

  it("admite como máximo un comodín por combinación", () => {
    expect(isSet(cards("7H XH XS"))).toBe(false);
    expect(isQuad(cards("9H 9S XH XS"))).toBe(false);
    expect(isRun(cards("4C 5C XH XS"))).toBe(false);
  });
});

describe("Comodín · candidatos y agrupación", () => {
  it("genera las ternas y cuartas que el comodín completa, una vez por comodín", () => {
    const hand = cards("7H 7S 5D 6D XH");
    expect(ids(setCandidates(hand))).toEqual(ids([cards("7H 7S XH"), cards("5D 6D XH")]));
    expect(quartaCandidates(cards("9H 9S 9D XS"))).toHaveLength(1);
    expect(setCandidates(cards("7H 7S XH XS"))).toHaveLength(2);
  });

  it("sin comodines genera las mismas combinaciones de siempre", () => {
    const candidates = setCandidates(cards("7H 7S 7D 5C 6C 7C"));
    expect(candidates).toHaveLength(5);
    expect(ids(candidates)).toContain("5C 6C 7C");
  });

  it("la mejor agrupación usa el comodín y no lo deja suelto", () => {
    const { melds, loose } = bestArrangement(cards("KH KS XH 2D"));
    expect(ids(melds)).toEqual(ids([cards("KH KS XH")]));
    expect(loose.map(cardId)).toEqual(["2D"]);
  });
});

describe("Comodín · cierres", () => {
  it("un cierre clásico con un comodín es válido", () => {
    const declaration = {
      type: "CLASICO" as const,
      melds: [cards("7H 7S 7D XH"), cards("KH KS KD"), cards("4C 5C 6C")],
      leftovers: [],
      discard: c("9S"),
    };
    expect(new ClassicRule().validate(declaration).valid).toBe(true);
  });

  it("un apuntado no puede dejar un comodín suelto: suma 25", () => {
    const declaration = {
      type: "APUNTADO" as const,
      melds: [cards("7H 7S 7D"), cards("KH KS KD"), cards("4C 5C 6C")],
      leftovers: [c("XH")],
      discard: null,
    };
    expect(new ApuntadoRule().validate(declaration)).toMatchObject({ valid: false, leftoverPoints: 25 });
  });

  it("el buscador encuentra un cierre que usa el comodín", () => {
    const found = findClosure(cards("7H 7S XH KH KS KD 4C 5C 6C 2D 9S"), ["APUNTADO"], null);
    expect(found?.type).toBe("APUNTADO");
    expect(found?.melds.flat().map(cardId)).toContain("XH");
  });

  it("el buscador prefiere quedarse con el comodín y descartar una carta real", () => {
    const found = findClosure(cards("XH 7H 7S 7D 7C KH KS KD 4C 4D 4H"), ["CLASICO"], null);
    expect(found?.type).toBe("CLASICO");
    expect(found?.discard).toEqual(c("7H"));
  });
});
