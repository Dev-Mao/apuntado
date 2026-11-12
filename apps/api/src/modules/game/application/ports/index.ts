import type { GameSession } from "../../domain/session/game-session.js";
import type { Room } from "../../domain/room/room.js";

export interface GameRepository {
  find(gameId: string): GameSession | null;
  save(session: GameSession): void;
  delete(gameId: string): void;
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

export interface RoomRepository {
  find(code: string): Room | null;
  findActiveByPlayer(playerId: string): Room | null;
  findByPlayer(playerId: string): Room | null;
  save(room: Room): void;
  delete(code: string): void;
}

export interface TableNotifier {
  lobbyChanged(code: string): void;
  tableChanged(code: string): void;
}

export interface TaskScheduler {
  schedule(key: string, at: Date, task: () => void): void;
  cancel(key: string): void;
}

export interface Presence {
  isConnected(playerId: string): boolean;
}

export interface AuthenticatedPlayer {
  readonly id: string;
  readonly nickname: string;
  readonly guest: boolean;
}

export interface PlayerIdentity {
  resolve(cookieHeader: string | undefined): AuthenticatedPlayer | null;
}
