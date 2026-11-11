import type { GameMode } from "../match/match.js";
import type { Round } from "../round/round.js";
import type { ClosureType } from "../rules/game-rule.js";
import type { RoundScore } from "../services/round-settler.js";

export interface SessionConfig {
  readonly mode: GameMode;
  readonly eliminationThreshold: number;
  readonly turnSeconds: number;
}

export type SessionStatus = "PLAYING" | "ROUND_OVER" | "FINISHED";

export type RoundState = Pick<
  Round,
  | "playerIds"
  | "currentPlayerId"
  | "currentPhase"
  | "currentStatus"
  | "stockSize"
  | "discardTop"
  | "cardTakenFromDiscard"
  | "handOf"
>;

export interface RoundSummary {
  readonly roundNumber: number;
  readonly winnerId: string | null;
  readonly closureType: ClosureType | null;
  readonly scores: readonly RoundScore[];
}

export interface ScoreLine {
  readonly playerId: string;
  readonly total: number;
  readonly eliminated: boolean;
}

export type GameEvent =
  | { readonly name: "RondaCerrada"; readonly gameId: string; readonly summary: RoundSummary }
  | { readonly name: "PartidaFinalizada"; readonly gameId: string; readonly winnerId: string; readonly scoreboard: readonly ScoreLine[] };
