import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { analyzeStructure } from "./analyze.js";
import { measureComplexity } from "./complexity.js";
import { type CoverageTotals, renderReport } from "./report.js";
import { ROOT } from "./source.js";

const REPORTS = join(ROOT, "reports");
const COVERAGE = join(REPORTS, "coverage", "coverage-summary.json");

const readCoverage = (): CoverageTotals | null => {
  if (!existsSync(COVERAGE)) return null;
  const { total } = JSON.parse(readFileSync(COVERAGE, "utf8"));
  return { lines: total.lines.pct, branches: total.branches.pct, functions: total.functions.pct };
};

const revision = (): string => {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "sin git";
  }
};

const structure = analyzeStructure();
const functions = await measureComplexity();
const markdown = renderReport({ structure, functions, coverage: readCoverage(), revision: revision(), generatedAt: new Date() });

mkdirSync(REPORTS, { recursive: true });
writeFileSync(join(REPORTS, "metricas.md"), markdown);
writeFileSync(join(REPORTS, "metricas.json"), JSON.stringify({ structure, functions }, null, 2));
const summaryFile = process.env["GITHUB_STEP_SUMMARY"];
if (summaryFile) appendFileSync(summaryFile, markdown);
console.log(`Reporte en reports/metricas.md (${structure.files} archivos, ${functions.length} funciones)`);
