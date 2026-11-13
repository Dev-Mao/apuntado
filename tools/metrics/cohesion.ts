import ts from "typescript";
import { toRepoPath } from "./source.js";

export interface ClassCohesion {
  readonly file: string;
  readonly line: number;
  readonly name: string;
  readonly methods: number;
  readonly fields: number;
  readonly lcom4: number;
}

type Method = ts.MethodDeclaration | ts.AccessorDeclaration | ts.PropertyDeclaration;

const nameOf = (member: ts.ClassElement | ts.ParameterDeclaration): string | null =>
  member.name && (ts.isIdentifier(member.name) || ts.isPrivateIdentifier(member.name)) ? member.name.text : null;

const isStatic = (member: ts.ClassElement): boolean =>
  ts.canHaveModifiers(member) && (ts.getModifiers(member)?.some((m) => m.kind === ts.SyntaxKind.StaticKeyword) ?? false);

const holdsFunction = (member: ts.ClassElement): boolean =>
  ts.isPropertyDeclaration(member) &&
  member.initializer !== undefined &&
  (ts.isArrowFunction(member.initializer) || ts.isFunctionExpression(member.initializer));

const isMethod = (member: ts.ClassElement): member is Method =>
  ts.isMethodDeclaration(member) || ts.isAccessor(member) || holdsFunction(member);

const fieldsOf = (node: ts.ClassDeclaration): Set<string> => {
  const constructor = node.members.find(ts.isConstructorDeclaration);
  const parameters = constructor?.parameters.filter((p) => ts.isParameterPropertyDeclaration(p, constructor)) ?? [];
  const properties = node.members.filter((m) => ts.isPropertyDeclaration(m) && !isStatic(m) && !holdsFunction(m));
  return new Set([...parameters, ...properties].map(nameOf).filter((name): name is string => name !== null));
};

const membersUsed = (node: ts.Node): Set<string> => {
  const used = new Set<string>();
  const visit = (child: ts.Node): void => {
    if (ts.isClassLike(child)) return;
    if (ts.isPropertyAccessExpression(child) && child.expression.kind === ts.SyntaxKind.ThisKeyword) used.add(child.name.text);
    ts.forEachChild(child, visit);
  };
  ts.forEachChild(node, visit);
  return used;
};

const componentsAmong = (count: number, links: readonly (readonly [number, number])[]): number => {
  const parent = Array.from({ length: count }, (_, index) => index);
  const root = (index: number): number => (parent[index] === index ? index : root(parent[index] ?? index));
  for (const [a, b] of links) parent[root(a)] = root(b);
  return new Set(parent.map((_, index) => root(index))).size;
};

const linksBetween = (methods: readonly Method[], fields: Set<string>): [number, number][] => {
  const names = methods.map(nameOf);
  const firstUser = new Map<string, number>();
  const links: [number, number][] = [];
  methods.forEach((method, index) => {
    for (const used of membersUsed(method)) {
      const callee = names.indexOf(used);
      if (callee >= 0) links.push([index, callee]);
      if (!fields.has(used)) continue;
      const owner = firstUser.get(used);
      if (owner === undefined) firstUser.set(used, index);
      else links.push([index, owner]);
    }
  });
  return links;
};

const cohesionOf = (file: ts.SourceFile, node: ts.ClassDeclaration): ClassCohesion | null => {
  const methods = node.members.filter((m): m is Method => isMethod(m) && !isStatic(m));
  if (methods.length < 2) return null;
  const fields = fieldsOf(node);
  return {
    file: toRepoPath(file.fileName),
    line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1,
    name: node.name?.text ?? "(anónima)",
    methods: methods.length,
    fields: fields.size,
    lcom4: componentsAmong(methods.length, linksBetween(methods, fields)),
  };
};

export const classCohesion = (file: ts.SourceFile): ClassCohesion[] =>
  file.statements
    .filter(ts.isClassDeclaration)
    .map((node) => cohesionOf(file, node))
    .filter((entry): entry is ClassCohesion => entry !== null);
