import type { GameSession } from "../../domain/session/game-session.js";

export interface GameRepository {
  find(gameId: string): GameSession | null;
  save(session: GameSession): void;
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
