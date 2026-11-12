import { describe, expect, it } from "vitest";
import { SystemRandom } from "./random.js";

describe("Aleatoriedad del sistema", () => {
  it("produce valores en [0, 1) a partir del generador criptográfico", () => {
    const random = new SystemRandom();
    const values = Array.from({ length: 2000 }, () => random.next());
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
    expect(new Set(values).size).toBeGreaterThan(1990);
  });
});
