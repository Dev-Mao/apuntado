import ts from "typescript";
import { isProjectFile, toRepoPath } from "./source.js";

export const DEMETER_HOPS = 2;

export interface DemeterFinding {
  readonly file: string;
  readonly line: number;
  readonly expression: string;
  readonly hops: number;
}

type Access = ts.PropertyAccessExpression | ts.ElementAccessExpression;

const isAccess = (node: ts.Node): node is Access => ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node);

const isWrapper = (node: ts.Node): node is ts.CallExpression | ts.NonNullExpression | ts.ParenthesizedExpression | ts.AsExpression =>
  ts.isCallExpression(node) || ts.isNonNullExpression(node) || ts.isParenthesizedExpression(node) || ts.isAsExpression(node);

const unwrap = (node: ts.Expression): ts.Expression => (isWrapper(node) ? unwrap(node.expression) : node);

const continuesChain = (node: ts.Node): boolean => {
  let current = node;
  while (isWrapper(current.parent) && current.parent.expression === current) current = current.parent;
  return isAccess(current.parent) && current.parent.expression === current;
};

const isDeclaredInProject = (type: ts.Type): boolean => {
  const symbol = type.aliasSymbol ?? type.getSymbol();
  return symbol?.declarations?.some((declaration) => isProjectFile(declaration.getSourceFile().fileName)) ?? false;
};

const isProjectType = (checker: ts.TypeChecker, node: ts.Expression): boolean => {
  const type = checker.getNonNullableType(checker.getTypeAtLocation(node));
  if (isDeclaredInProject(type)) return true;
  return type.isUnion() && type.types.every(isDeclaredInProject);
};

const hopsOf = (checker: ts.TypeChecker, node: ts.Expression): number => {
  const access = unwrap(node);
  if (!isAccess(access) || access.expression.kind === ts.SyntaxKind.ThisKeyword) return 0;
  const before = hopsOf(checker, access.expression);
  return isProjectType(checker, access.expression) ? before + 1 : before;
};

const describe = (file: ts.SourceFile, node: Access, hops: number): DemeterFinding => ({
  file: toRepoPath(file.fileName),
  line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1,
  expression: node.getText(file).replace(/\s+/g, " ").slice(0, 90),
  hops,
});

export const demeterFindings = (checker: ts.TypeChecker, file: ts.SourceFile): DemeterFinding[] => {
  const findings: DemeterFinding[] = [];
  const visit = (node: ts.Node): void => {
    if (isAccess(node) && !continuesChain(node)) {
      const hops = hopsOf(checker, node);
      if (hops > DEMETER_HOPS) findings.push(describe(file, node, hops));
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return findings;
};
