import ts from "typescript";
import { isProjectFile, toRepoPath } from "./source.js";

export interface Dependency {
  readonly from: string;
  readonly to: string;
}

export interface Coupling {
  readonly afferent: number;
  readonly efferent: number;
  readonly instability: number;
}

const specifierOf = (statement: ts.Statement): string | null => {
  if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) return null;
  const specifier = statement.moduleSpecifier;
  return specifier && ts.isStringLiteral(specifier) ? specifier.text : null;
};

const resolve = (program: ts.Program, specifier: string, file: ts.SourceFile): string | null => {
  const resolved = ts.resolveModuleName(specifier, file.fileName, program.getCompilerOptions(), ts.sys).resolvedModule;
  return resolved && isProjectFile(resolved.resolvedFileName) ? toRepoPath(resolved.resolvedFileName) : null;
};

export const dependenciesOf = (program: ts.Program, files: readonly ts.SourceFile[]): Dependency[] =>
  files.flatMap((file) =>
    file.statements.flatMap((statement) => {
      const specifier = specifierOf(statement);
      const target = specifier ? resolve(program, specifier, file) : null;
      return target ? [{ from: toRepoPath(file.fileName), to: target }] : [];
    }),
  );

const setFor = (sets: Map<string, Set<string>>, group: string): Set<string> => {
  const existing = sets.get(group);
  if (existing) return existing;
  const created = new Set<string>();
  sets.set(group, created);
  return created;
};

export const instabilityOf = (afferent: number, efferent: number): number =>
  afferent + efferent === 0 ? 0 : efferent / (afferent + efferent);

export const couplingBy = (
  dependencies: readonly Dependency[],
  groups: readonly string[],
  groupOf: (path: string) => string,
): Map<string, Coupling> => {
  const incoming = new Map<string, Set<string>>();
  const outgoing = new Map<string, Set<string>>();
  for (const { from, to } of dependencies) {
    const source = groupOf(from);
    const target = groupOf(to);
    if (source === target) continue;
    setFor(outgoing, source).add(from);
    setFor(incoming, target).add(from);
  }
  return new Map(
    groups.map((group) => {
      const afferent = incoming.get(group)?.size ?? 0;
      const efferent = outgoing.get(group)?.size ?? 0;
      return [group, { afferent, efferent, instability: instabilityOf(afferent, efferent) }];
    }),
  );
};
