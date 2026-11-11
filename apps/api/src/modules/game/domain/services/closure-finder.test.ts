import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { SeededRandom } from "../../../../shared/random.js";
import type { Card } from "../entities/card.js";
import { createDeck, shuffle } from "../entities/deck.js";
import { ApuntadoRule } from "../rules/apuntado-rule.js";
import { ClassicRule } from "../rules/classic-rule.js";
import { c, cards } from "../round/round.test-support.js";
import { findClosure } from "./closure-finder.js";

const RULES = { CLASICO: new ClassicRule(), APUNTADO: new ApuntadoRule() };

type HandShape = "THREE_SETS" | "CLASSIC";

const handAround = (shape: HandShape, seed: number): Card[] => {
  const random = new SeededRandom(seed);
  const deck = shuffle(createDeck(), random);
  const ranks = [...new Set(deck.map((x) => x.rank))];
  const sizes = shape === "CLASSIC" ? [4, 3, 3] : [3, 3, 3];
  const melds = sizes.flatMap((size, i) => deck.filter((x) => x.rank === ranks[i]).slice(0, size));
  const extra = deck.filter((x) => !melds.includes(x)).slice(0, 11 - melds.length);
  return shuffle([...melds, ...extra], random);
};

describe("Buscador de cierres", () => {
  it("encuentra un cierre clásico y elige la carta sobrante como descarte", () => {
    const found = findClosure(cards("7H 7S 7D 7C KH KS KD 4C 4D 4H 9S"), ["CLASICO"], null);
    expect(found?.type).toBe("CLASICO");
    expect(found?.discard).toEqual(c("9S"));
  });

  it("encuentra un cierre clásico con la cuarta por secuencia", () => {
    const found = findClosure(cards("5H 6H 7H 8H KH KS KD 4C 4D 4S 9S"), ["CLASICO"], null);
    expect(found?.melds[0]).toHaveLength(4);
  });

  it("toca sin descartar cuando las dos sobrantes suman menos de 5", () => {
    const found = findClosure(cards("3H 3S 3D 9C 9H 9S QH QS QD AD AC"), ["APUNTADO"], null);
    expect(found).toMatchObject({ type: "APUNTADO", discard: null });
    expect(found?.leftovers).toHaveLength(2);
  });

  it("toca descartando la sobrante alta cuando la otra suma menos de 5", () => {
    const found = findClosure(cards("3H 3S 3D 9C 9H 9S QH QS QD 4D KC"), ["APUNTADO"], null);
    expect(found).toMatchObject({ type: "APUNTADO", discard: c("KC"), leftovers: [c("4D")] });
  });

  it("no descarta la carta que acaba de tomar del pozo", () => {
    expect(findClosure(cards("3H 3S 3D 9C 9H 9S QH QS QD 4D KC"), ["APUNTADO"], c("KC"))).toBeNull();
  });

  it("solo busca los cierres habilitados", () => {
    expect(findClosure(cards("7H 7S 7D 7C KH KS KD 4C 4D 4H 9S"), ["APUNTADO"], null)).toBeNull();
  });

  it("no encuentra cierre si ninguna forma de tocar deja sobrantes por debajo de 5", () => {
    expect(findClosure(cards("3H 3S 3D 9C 9H 9S QH QS QD 5C 6D"), ["APUNTADO"], null)).toBeNull();
  });

  it("solo trabaja con manos de 11 cartas", () => {
    expect(findClosure(cards("7H 7S 7D 7C KH KS KD 4C 4D 4H"), ["CLASICO"], null)).toBeNull();
  });

  it("todo cierre que encuentra es aceptado por la regla correspondiente", () => {
    fc.assert(
      fc.property(fc.nat(), fc.constantFrom<HandShape>("THREE_SETS", "CLASSIC"), (seed, shape) => {
        const found = findClosure(handAround(shape, seed), ["CLASICO", "APUNTADO"], null);
        if (found) expect(RULES[found.type].validate(found).valid).toBe(true);
      }),
      { numRuns: 1000 },
    );
  });

  it("en una mano con una cuarta, dos ternas y una carta más siempre encuentra el cierre clásico", () => {
    fc.assert(
      fc.property(fc.nat(), (seed) => {
        expect(findClosure(handAround("CLASSIC", seed), ["CLASICO"], null)?.type).toBe("CLASICO");
      }),
      { numRuns: 1000 },
    );
  });
});
