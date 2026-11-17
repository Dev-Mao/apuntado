import { describe, expect, it } from "vitest";
import { card } from "../../domain/entities/card.js";
import { parseCard, parseSettings } from "./payload-parser.js";

const SETTINGS = { mode: "CLASICA", eliminationThreshold: 101, turnSeconds: 60, stake: 0 };

describe("Lectura de mensajes del cliente · comodines", () => {
  it("acepta el comodín rojo y el negro, y ningún otro palo de comodín", () => {
    expect(parseCard({ rank: "X", suit: "H" })).toEqual(card("X", "H"));
    expect(parseCard({ rank: "X", suit: "S" })).toEqual(card("X", "S"));
    expect(parseCard({ rank: "X", suit: "D" })).toBeNull();
  });

  it("lee el ajuste de comodines y lo deja apagado si no viene", () => {
    expect(parseSettings({ ...SETTINGS, jokers: true })?.jokers).toBe(true);
    expect(parseSettings(SETTINGS)?.jokers).toBe(false);
    expect(parseSettings({ ...SETTINGS, jokers: "sí" })).toBeNull();
  });
});
