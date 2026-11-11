import type { ClosureType } from "../rules/game-rule.js";

export type RoundPhase = "DRAW" | "DISCARD";

export type RoundStatus = "PLAYING" | "CLOSED" | "EXHAUSTED";

export type Outcome = { readonly ok: true } | { readonly ok: false; readonly reason: string };

export const OK: Outcome = { ok: true };

export const rejected = (reason: string): Outcome => ({ ok: false, reason });

export interface RoundClosure {
  readonly winnerId: string;
  readonly type: ClosureType;
}
