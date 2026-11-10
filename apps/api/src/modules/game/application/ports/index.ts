import type { ClosureType } from "../../domain/rules/game-rule.js";

/** Puertos que el módulo Juego DECLARA y otros implementan (inversión de dependencias). */

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

/** Implementado por el módulo Economía. El Juego no conoce su implementación. */
export interface StakeGuard {
  hasSufficientBalance(playerId: string, stake: number): boolean;
}

/** Bitácora asíncrona de jugadas: fuera del camino crítico del turno (ADR-05). */
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

/** Eventos de dominio: Economía e Historial reaccionan sin que el Juego los conozca. */
export interface EventBus {
  publish(eventName: string, payload: Record<string, unknown>): void;
}
