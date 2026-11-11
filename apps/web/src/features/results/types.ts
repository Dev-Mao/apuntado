import type { ClosureType, GameMode } from "@apuntado/contracts";

export const RESULT_STATUS = {
  WINNER: "winner",
  ELIMINATED: "eliminated",
  CLOSED: "closed",
  PLAYING: "playing",
} as const;

export type ResultStatus = (typeof RESULT_STATUS)[keyof typeof RESULT_STATUS];

export interface ResultRow {
  readonly playerId: string;
  readonly name: string;
  readonly roundPoints: number;
  readonly total: number;
  readonly eliminated: boolean;
  readonly status: ResultStatus;
}

export interface ResultsSummary {
  readonly mode: GameMode;
  readonly threshold: number;
  readonly roundNumber: number;
  readonly isFinished: boolean;
  readonly winnerName: string | null;
  readonly roundWinnerName: string | null;
  readonly closureType: ClosureType | null;
  readonly rows: readonly ResultRow[];
}
