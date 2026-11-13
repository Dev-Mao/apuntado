import type { Zone } from "./abstractness.js";
import type { ComponentMetric, StructureMetrics } from "./analyze.js";
import type { ClassCohesion } from "./cohesion.js";
import { COMPLEXITY_GOAL, COMPLEXITY_LIMIT, type FunctionComplexity } from "./complexity.js";
import { DEMETER_HOPS } from "./demeter.js";

export interface CoverageTotals {
  readonly lines: number;
  readonly branches: number;
  readonly functions: number;
}

export interface ReportInput {
  readonly structure: StructureMetrics;
  readonly functions: readonly FunctionComplexity[];
  readonly coverage: CoverageTotals | null;
  readonly revision: string;
  readonly generatedAt: Date;
}

const RULE_PACKAGES = /modules\/game\/domain\/(rules|services)\//;

const ZONE_LABEL: Record<Zone, string> = {
  SECUENCIA: "Cerca de la secuencia principal",
  INTERMEDIA: "Intermedia",
  DOLOR: "Zona de dolor",
  INUTILIDAD: "Zona de inutilidad",
};

const decimal = (text: string): string => text.replace(".", ",");
const fixed = (value: number): string => decimal(value.toFixed(2));
const percent = (part: number, whole: number): string => (whole === 0 ? "0 %" : `${decimal(((100 * part) / whole).toFixed(1))} %`);
const where = (file: string, line: number): string => `\`${file.replace(/^apps\/api\/src\//, "")}:${line}\``;

const table = (headers: readonly string[], rows: readonly (readonly (string | number)[])[]): string =>
  [`| ${headers.join(" | ")} |`, `|${headers.map(() => "---").join("|")}|`, ...rows.map((row) => `| ${row.join(" | ")} |`)].join(
    "\n",
  );

export const isStateful = (entry: ClassCohesion): boolean => entry.fields > 0;

const summary = ({ structure, functions, coverage }: ReportInput): string => {
  const max = Math.max(0, ...functions.map((f) => f.complexity));
  const simple = functions.filter((f) => f.complexity < COMPLEXITY_GOAL).length;
  const split = structure.cohesion.filter((c) => isStateful(c) && c.lcom4 > 1).length;
  const zone = (z: Zone) => structure.packages.filter((p) => p.zone === z).length;
  const rows: (string | number)[][] = [
    ["Complejidad ciclomática máxima", max, `≤ ${COMPLEXITY_LIMIT} (deseable < ${COMPLEXITY_GOAL})`],
    [`Funciones con complejidad < ${COMPLEXITY_GOAL}`, `${percent(simple, functions.length)} (${simple} de ${functions.length})`, "Informativo"],
    ["Expresiones que encadenan más de dos objetos ajenos", structure.demeter.length, "0"],
    ["Clases con estado y LCOM4 > 1", `${split} de ${structure.cohesion.length}`, "Informativo"],
    ["Paquetes en la zona de dolor", zone("DOLOR"), "Informativo"],
    ["Paquetes en la zona de inutilidad", zone("INUTILIDAD"), "0"],
  ];
  if (coverage) rows.push(["Cobertura de líneas, ramas y funciones", [coverage.lines, coverage.branches, coverage.functions].map((pct) => `${decimal(String(pct))} %`).join(", "), "≥ 90 %, 88 %, 92 %"]);
  return `## Resumen\n\n${table(["Medida", "Valor", "Umbral"], rows)}`;
};

const complexity = ({ functions }: ReportInput): string => {
  const count = (low: number, high: number) => functions.filter((f) => f.complexity >= low && f.complexity <= high).length;
  const bands = table(
    ["Complejidad", "Funciones", "Porcentaje"],
    [
      ["1 a 4", count(1, 4), percent(count(1, 4), functions.length)],
      ["5 a 7", count(5, 7), percent(count(5, 7), functions.length)],
      ["8 a 10", count(8, 10), percent(count(8, 10), functions.length)],
      ["Más de 10", count(11, Infinity), percent(count(11, Infinity), functions.length)],
    ],
  );
  const byComplexity = [...functions].sort((a, b) => b.complexity - a.complexity);
  const row = (f: FunctionComplexity) => [f.complexity, f.name, where(f.file, f.line)];
  const rules = byComplexity.filter((f) => RULE_PACKAGES.test(f.file));
  return [
    "## Complejidad ciclomática",
    bands,
    "### Las diez funciones más complejas",
    table(["CC", "Función", "Ubicación"], byComplexity.slice(0, 10).map(row)),
    `### Evaluación de ternas, cuartas y liquidación (\`game/domain/rules\` y \`game/domain/services\`)`,
    `${rules.length} funciones; máxima ${rules[0]?.complexity ?? 0}; ${percent(rules.filter((f) => f.complexity < COMPLEXITY_GOAL).length, rules.length)} por debajo de ${COMPLEXITY_GOAL}.`,
    table(["CC", "Función", "Ubicación"], rules.slice(0, 15).map(row)),
  ].join("\n\n");
};

const componentRows = (components: readonly ComponentMetric[]) =>
  components.map((c) => [
    `\`${c.name}\``,
    c.files,
    `${c.abstract}/${c.abstract + c.concrete}`,
    c.afferent,
    c.efferent,
    fixed(c.instability),
    fixed(c.abstractness),
    fixed(c.distance),
    ZONE_LABEL[c.zone],
  ]);

const COMPONENT_HEADERS = ["Componente", "Archivos", "Abstractos", "Ca", "Ce", "I", "A", "D", "Ubicación"];

const coupling = ({ structure }: ReportInput): string =>
  [
    "## Acoplamiento, abstracción y distancia a la secuencia principal",
    `${structure.files} archivos de producción y ${structure.dependencies} dependencias internas.`,
    "### Por módulo",
    table(COMPONENT_HEADERS, componentRows(structure.modules)),
    "### Por paquete (carpeta)",
    table(COMPONENT_HEADERS, componentRows(structure.packages)),
  ].join("\n\n");

const demeter = ({ structure }: ReportInput): string => {
  const intro = `Se marca toda expresión que atraviesa más de ${DEMETER_HOPS} objetos de tipos del proyecto (\`a.b.c.d\`). \`this\` no cuenta como salto, y los métodos de arreglos, cadenas, promesas y librerías no se cuentan.`;
  const findings = structure.demeter.length
    ? table(["Saltos", "Expresión", "Ubicación"], structure.demeter.map((d) => [d.hops, `\`${d.expression}\``, where(d.file, d.line)]))
    : "Ninguna expresión supera el límite.";
  return ["## Ley de Deméter (aproximación)", intro, findings].join("\n\n");
};

const cohesion = ({ structure }: ReportInput): string => {
  const split = structure.cohesion.filter((c) => c.lcom4 > 1).sort((a, b) => b.lcom4 - a.lcom4);
  const rows = split.map((c) => [`\`${c.name}\``, c.lcom4, c.methods, isStateful(c) ? c.fields : "Sin estado", where(c.file, c.line)]);
  return [
    "## Cohesión (LCOM4)",
    `LCOM4 cuenta los grupos de métodos que no comparten campos ni se llaman entre sí; 1 es una clase cohesiva. Se miden ${structure.cohesion.length} clases con dos métodos o más. En una clase sin estado cada método queda solo y la medida no indica falta de cohesión.`,
    split.length ? table(["Clase", "LCOM4", "Métodos", "Campos", "Ubicación"], rows) : "Todas las clases tienen LCOM4 = 1.",
  ].join("\n\n");
};

const METHOD = `## Cómo se calcula

- **Ca y Ce** siguen a Robert C. Martin: Ca cuenta los archivos de fuera que dependen de algún archivo del componente y Ce los archivos del componente que dependen de algo de fuera. Solo cuentan las dependencias entre archivos del proyecto, incluidas las de solo tipos.
- **I = Ce / (Ca + Ce)**. **A** es la proporción de declaraciones abstractas (interfaces, tipos de objeto o función y clases abstractas) sobre el total con las concretas (clases y funciones). **D = |A + I − 1|**.
- Un componente está cerca de la secuencia principal con D ≤ 0,3, y en una zona con D ≥ 0,7: la de dolor si A + I < 1 (concreto y estable) y la de inutilidad si A + I > 1 (abstracto y sin usuarios).
- **La complejidad ciclomática** la calcula la regla \`complexity\` de ESLint para cada función.`;

export const renderReport = (input: ReportInput): string =>
  [
    "# Métricas de arquitectura",
    `Revisión \`${input.revision}\`, generado el ${input.generatedAt.toISOString().slice(0, 16).replace("T", " ")} UTC.`,
    summary(input),
    complexity(input),
    coupling(input),
    demeter(input),
    cohesion(input),
    METHOD,
  ].join("\n\n") + "\n";
