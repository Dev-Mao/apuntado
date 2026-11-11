import type { Card } from "../entities/card.js";

export type ClosureType = "CLASICO" | "APUNTADO";

export interface ClosureDeclaration {
  readonly type: ClosureType;
  readonly melds: readonly (readonly Card[])[];
  readonly leftovers: readonly Card[];
  readonly discard: Card | null;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly reason: string | null;
  readonly leftoverPoints: number;
}

export const invalid = (reason: string, leftoverPoints = 0): ValidationResult =>
  ({ valid: false, reason, leftoverPoints });

export const valid = (leftoverPoints = 0): ValidationResult =>
  ({ valid: true, reason: null, leftoverPoints });

export interface GameRule {
  readonly type: ClosureType;
  validate(declaration: ClosureDeclaration): ValidationResult;
}
