import ts from "typescript";

export interface Declarations {
  readonly abstract: number;
  readonly concrete: number;
}

const NONE: Declarations = { abstract: 0, concrete: 0 };

const isContractType = (type: ts.TypeNode): boolean =>
  ts.isTypeLiteralNode(type) ||
  ts.isFunctionTypeNode(type) ||
  (ts.isIntersectionTypeNode(type) && type.types.some(isContractType));

const isFunctionValue = (declaration: ts.VariableDeclaration): boolean => {
  const value = declaration.initializer;
  return value !== undefined && (ts.isArrowFunction(value) || ts.isFunctionExpression(value));
};

const isAbstractClass = (node: ts.ClassDeclaration): boolean =>
  node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.AbstractKeyword) ?? false;

const classify = (statement: ts.Statement): Declarations => {
  if (ts.isInterfaceDeclaration(statement)) return { abstract: 1, concrete: 0 };
  if (ts.isTypeAliasDeclaration(statement)) return isContractType(statement.type) ? { abstract: 1, concrete: 0 } : NONE;
  if (ts.isClassDeclaration(statement)) return isAbstractClass(statement) ? { abstract: 1, concrete: 0 } : { abstract: 0, concrete: 1 };
  if (ts.isFunctionDeclaration(statement)) return statement.body ? { abstract: 0, concrete: 1 } : NONE;
  if (ts.isVariableStatement(statement))
    return { abstract: 0, concrete: statement.declarationList.declarations.filter(isFunctionValue).length };
  return NONE;
};

export const declarationsIn = (file: ts.SourceFile): Declarations =>
  file.statements.map(classify).reduce(
    (total, next) => ({ abstract: total.abstract + next.abstract, concrete: total.concrete + next.concrete }),
    NONE,
  );

export const abstractnessOf = ({ abstract, concrete }: Declarations): number =>
  abstract + concrete === 0 ? 0 : abstract / (abstract + concrete);

export const distanceOf = (abstractness: number, instability: number): number =>
  Math.abs(abstractness + instability - 1);

export type Zone = "SECUENCIA" | "INTERMEDIA" | "DOLOR" | "INUTILIDAD";

export const NEAR_SEQUENCE = 0.3;
export const ZONE_DISTANCE = 0.7;

export const zoneOf = (abstractness: number, instability: number): Zone => {
  const distance = distanceOf(abstractness, instability);
  if (distance <= NEAR_SEQUENCE) return "SECUENCIA";
  if (distance < ZONE_DISTANCE) return "INTERMEDIA";
  return abstractness + instability < 1 ? "DOLOR" : "INUTILIDAD";
};
