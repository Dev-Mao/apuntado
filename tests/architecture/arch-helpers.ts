import { expect } from "vitest";
import type { Checkable } from "tsarch/dist/src/common/fluentapi/checkable.js";

/** Ejecuta una regla de arquitectura y falla mostrando las violaciones encontradas. */
export async function expectNoViolations(rule: Checkable, ruleName: string): Promise<void> {
  const violations = await rule.check();
  const detail = violations.map((v) => `  · ${JSON.stringify(v)}`).join("\n");
  expect(violations, `${ruleName} — violaciones:\n${detail}`).toHaveLength(0);
}
