import type { ClosureType } from "../../domain/rules/game-rule.js";

export interface GameSnapshot {
  readonly gameId: string;
  readonly currentPlayerId: string;
  readonly enabledClosures: readonly ClosureType[];
  readonly eliminationThreshold: number;
}

export interface GameRepository {
  find(gameId: string): GameSnapshot | null;
  save(snapshot: GameSnapshot): void;
}

export interface StakeGuard {
  hasSufficientBalance(playerId: string, stake: number): boolean;
}

export interface PlayJournal {
  record(entry: PlayJournalEntry): void;
}

export interface PlayJournalEntry {
  readonly gameId: string;
  readonly roundNumber: number;
  readonly playerId: string;
  readonly action: "ROBAR_MAZO" | "ROBAR_POZO" | "DESCARTAR" | "DECLARAR_CIERRE";
  readonly cardId: string | null;
  readonly occurredAt: Date;
}

export interface EventBus {
  publish(eventName: string, payload: Record<string, unknown>): void;
}
