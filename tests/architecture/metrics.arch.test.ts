import { readdirSync, readFileSync } from "node:fs";
import ts from "typescript";
import { beforeAll, describe, expect, it } from "vitest";
import { NEAR_SEQUENCE, ZONE_DISTANCE } from "../../tools/metrics/abstractness.js";
import { analyzeStructure, type ComponentMetric, type StructureMetrics } from "../../tools/metrics/analyze.js";
import { isStateful } from "../../tools/metrics/report.js";

let metrics: StructureMetrics;

beforeAll(() => {
  metrics = analyzeStructure();
}, 120_000);

const packageNamed = (name: string): ComponentMetric => {
  const found = metrics.packages.find((p) => p.name === name);
  if (!found) throw new Error(`No existe el paquete ${name}`);
  return found;
};

describe("FF-09 · Ley de Deméter (aproximación)", () => {
  it("ninguna expresión del servidor atraviesa más de dos objetos ajenos", () => {
    const detail = metrics.demeter.map((d) => `  · ${d.file}:${d.line} ${d.expression}`).join("\n");
    expect(metrics.demeter, `Expresiones encadenadas:\n${detail}`).toEqual([]);
  });
});

describe("FF-10 · Distancia a la secuencia principal", () => {
  it("las reglas de juego quedan lejos de las zonas de dolor e inutilidad", () => {
    expect(packageNamed("modules/game/domain/rules").distance).toBeLessThan(ZONE_DISTANCE);
  });

  it("ningún paquete cae en la zona de inutilidad", () => {
    expect(metrics.packages.filter((p) => p.zone === "INUTILIDAD").map((p) => p.name)).toEqual([]);
  });

  it("los contratos y los puertos del juego son abstractos y estables", () => {
    for (const name of ["contracts", "modules/game/application/ports"]) {
      expect(packageNamed(name).distance, name).toBeLessThanOrEqual(NEAR_SEQUENCE);
    }
  });
});

describe("FF-11 · Cohesión del dominio", () => {
  it("toda clase del dominio con estado tiene LCOM4 = 1", () => {
    const split = metrics.cohesion.filter((c) => c.file.includes("/domain/") && isStateful(c) && c.lcom4 > 1);
    expect(split.map((c) => `${c.name} (LCOM4 ${c.lcom4})`)).toEqual([]);
  });
});

describe("FF-13 · Los contratos son solo tipos", () => {
  it("packages/contracts no declara nada que exista en tiempo de ejecución", () => {
    const folder = new URL("../../packages/contracts/src/", import.meta.url);
    const isTypeOnly = (s: ts.Statement) =>
      ts.isInterfaceDeclaration(s) ||
      ts.isTypeAliasDeclaration(s) ||
      (ts.isExportDeclaration(s) && s.isTypeOnly) ||
      (ts.isImportDeclaration(s) && (s.importClause?.isTypeOnly ?? false));
    const runtime = readdirSync(folder)
      .filter((name) => name.endsWith(".ts"))
      .flatMap((name) => {
        const file = ts.createSourceFile(name, readFileSync(new URL(name, folder), "utf8"), ts.ScriptTarget.ES2022);
        return file.statements.filter((s) => !isTypeOnly(s)).map((s) => `${name}: ${s.getText(file).slice(0, 60)}`);
      });
    expect(runtime).toEqual([]);
  });
});
