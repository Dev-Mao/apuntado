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

export interface SessionIds {
  readonly gameId: string;
  readonly matchId: string;
}

export interface DealtHand {
  readonly playerId: string;
  readonly cards: readonly string[];
}

interface EventBase extends SessionIds {
  readonly at: Date;
}

export interface RoundStarted extends EventBase {
  readonly name: "RondaIniciada";
  readonly roundNumber: number;
  readonly hands: readonly DealtHand[];
}

export interface RoundClosed extends EventBase {
  readonly name: "RondaCerrada";
  readonly summary: RoundSummary;
  readonly scoreboard: readonly ScoreLine[];
}

export interface MatchFinished extends EventBase {
  readonly name: "PartidaFinalizada";
  readonly winnerId: string;
  readonly scoreboard: readonly ScoreLine[];
}

export type GameEvent = RoundStarted | RoundClosed | MatchFinished;
