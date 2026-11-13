import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const ROOT = fileURLToPath(new URL("../..", import.meta.url));

const SOURCE_ROOTS = ["apps/api/src/", "packages/contracts/src/"];
const TEST_FILE = /\.test(-support)?\.ts$/;

export const toRepoPath = (absolute: string): string => relative(ROOT, absolute).split(sep).join("/");

export const isProjectFile = (absolute: string): boolean => {
  const path = toRepoPath(absolute);
  return SOURCE_ROOTS.some((root) => path.startsWith(root)) && !TEST_FILE.test(path) && !path.endsWith(".d.ts");
};

export const packageOf = (path: string): string => {
  const folder = path.slice(0, path.lastIndexOf("/"));
  return folder.replace(/^apps\/api\/src\/?/, "").replace(/^packages\/contracts\/src$/, "contracts") || "(raíz)";
};

export const moduleOf = (path: string): string => {
  const module = /^apps\/api\/src\/modules\/([^/]+)\//.exec(path)?.[1];
  if (module) return module;
  if (path.startsWith("apps/api/src/shared/")) return "shared";
  if (path.startsWith("packages/contracts/")) return "contracts";
  return "composición";
};

export const loadProgram = (): ts.Program => {
  const host = { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined };
  const parsed = ts.getParsedCommandLineOfConfigFile(join(ROOT, "tsconfig.json"), {}, host);
  if (!parsed) throw new Error("No se pudo leer tsconfig.json");
  return ts.createProgram(parsed.fileNames.filter(isProjectFile), parsed.options);
};

export const projectFiles = (program: ts.Program): readonly ts.SourceFile[] =>
  program.getSourceFiles().filter((file) => isProjectFile(file.fileName));
