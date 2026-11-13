import { abstractnessOf, type Declarations, declarationsIn, distanceOf, type Zone, zoneOf } from "./abstractness.js";
import { type ClassCohesion, classCohesion } from "./cohesion.js";
import { couplingBy, type Dependency, dependenciesOf } from "./coupling.js";
import { type DemeterFinding, demeterFindings } from "./demeter.js";
import { loadProgram, moduleOf, packageOf, projectFiles, toRepoPath } from "./source.js";

export interface ComponentMetric {
  readonly name: string;
  readonly module: string;
  readonly files: number;
  readonly abstract: number;
  readonly concrete: number;
  readonly afferent: number;
  readonly efferent: number;
  readonly instability: number;
  readonly abstractness: number;
  readonly distance: number;
  readonly zone: Zone;
}

export interface StructureMetrics {
  readonly files: number;
  readonly dependencies: number;
  readonly packages: readonly ComponentMetric[];
  readonly modules: readonly ComponentMetric[];
  readonly demeter: readonly DemeterFinding[];
  readonly cohesion: readonly ClassCohesion[];
}

const groupBy = (paths: readonly string[], groupOf: (path: string) => string): Map<string, string[]> => {
  const groups = new Map<string, string[]>();
  for (const path of paths) groups.set(groupOf(path), [...(groups.get(groupOf(path)) ?? []), path]);
  return groups;
};

const total = (paths: readonly string[], declarations: ReadonlyMap<string, Declarations>): Declarations =>
  paths.reduce(
    (sum, path) => {
      const own = declarations.get(path) ?? { abstract: 0, concrete: 0 };
      return { abstract: sum.abstract + own.abstract, concrete: sum.concrete + own.concrete };
    },
    { abstract: 0, concrete: 0 },
  );

const componentsBy = (
  dependencies: readonly Dependency[],
  declarations: ReadonlyMap<string, Declarations>,
  groupOf: (path: string) => string,
): ComponentMetric[] => {
  const members = groupBy([...declarations.keys()], groupOf);
  const coupling = couplingBy(dependencies, [...members.keys()], groupOf);
  return [...members].map(([name, paths]) => {
    const counts = total(paths, declarations);
    const { afferent = 0, efferent = 0, instability = 0 } = coupling.get(name) ?? {};
    const abstractness = abstractnessOf(counts);
    return {
      name,
      module: moduleOf(paths[0] ?? ""),
      files: paths.length,
      ...counts,
      afferent,
      efferent,
      instability,
      abstractness,
      distance: distanceOf(abstractness, instability),
      zone: zoneOf(abstractness, instability),
    };
  });
};

export const analyzeStructure = (): StructureMetrics => {
  const program = loadProgram();
  const checker = program.getTypeChecker();
  const files = projectFiles(program);
  const dependencies = dependenciesOf(program, files);
  const declarations = new Map(files.map((file) => [toRepoPath(file.fileName), declarationsIn(file)]));
  const byName = (a: ComponentMetric, b: ComponentMetric) => a.name.localeCompare(b.name);
  return {
    files: files.length,
    dependencies: dependencies.length,
    packages: componentsBy(dependencies, declarations, packageOf).sort(byName),
    modules: componentsBy(dependencies, declarations, moduleOf).sort(byName),
    demeter: files.flatMap((file) => demeterFindings(checker, file)),
    cohesion: files.flatMap(classCohesion),
  };
};
