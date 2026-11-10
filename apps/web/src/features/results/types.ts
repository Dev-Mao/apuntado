import type { GameMode } from "@apuntado/contracts";

export interface PlayerResult {
  readonly id: string;
  readonly name: string;
  readonly roundPoints: number;
  readonly totalPoints: number;
  readonly isEliminated: boolean;
  readonly closedRound: boolean;
}

export interface ResultsView {
  readonly round: number;
  readonly mode: GameMode;
  readonly eliminationThreshold: number;
  readonly players: readonly PlayerResult[];
  readonly winnerId: string | null;
}
