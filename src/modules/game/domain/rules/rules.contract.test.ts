import { describe, expect, it } from "vitest";
import { card } from "../entities/card.js";
import { ApuntadoRule } from "./apuntado-rule.js";
import { ClassicRule } from "./classic-rule.js";
import type { ClosureDeclaration, GameRule } from "./game-rule.js";

/**
 * C-01 (ADR-02 y ADR-03): batería de pruebas de contrato.
 * Toda implementación de ReglaJuego debe superarla. Una variante nueva, por ejemplo el
 * comodín, se agrega a esta lista y hereda las mismas exigencias sin escribir pruebas nuevas.
 */
const IMPLEMENTACIONES: readonly GameRule[] = [new ClassicRule(), new ApuntadoRule()];

const terna = (rank: "7" | "9" | "K") =>
  [card(rank, "H"), card(rank, "S"), card(rank, "D")] as const;

const vacia = (type: ClosureDeclaration["type"]): ClosureDeclaration => ({
  type, melds: [], leftovers: [], discard: null,
});

const conCartaRepetida = (type: ClosureDeclaration["type"]): ClosureDeclaration => ({
  type,
  melds: [terna("7"), terna("7"), terna("9")],
  leftovers: [],
  discard: card("K", "C"),
});

describe.each(IMPLEMENTACIONES.map((r) => [r.type, r] as const))("Contrato de ReglaJuego: %s", (_tipo, regla) => {
  it("rechaza una declaración vacía e informa el motivo", () => {
    const resultado = regla.validate(vacia(regla.type));
    expect(resultado.valid).toBe(false);
    expect(resultado.reason).toBeTruthy();
  });

  it("rechaza una carta usada en dos combinaciones e informa el motivo", () => {
    const resultado = regla.validate(conCartaRepetida(regla.type));
    expect(resultado.valid).toBe(false);
    expect(resultado.reason).toBeTruthy();
  });

  it("no modifica la declaración que recibe", () => {
    const declaracion = Object.freeze(conCartaRepetida(regla.type));
    const antes = JSON.stringify(declaracion);
    regla.validate(declaracion);
    expect(JSON.stringify(declaracion)).toBe(antes);
  });

  it("es determinista: la misma declaración produce el mismo resultado", () => {
    const declaracion = conCartaRepetida(regla.type);
    expect(regla.validate(declaracion)).toEqual(regla.validate(declaracion));
  });

  it("un resultado válido nunca trae motivo de rechazo", () => {
    const apuntado = new ApuntadoRule().validate({
      type: "APUNTADO",
      melds: [terna("7"), terna("9"), terna("K")],
      leftovers: [card("A", "D"), card("A", "C")],
      discard: null,
    });
    expect(apuntado.valid).toBe(true);
    expect(apuntado.reason).toBeNull();
  });
});
