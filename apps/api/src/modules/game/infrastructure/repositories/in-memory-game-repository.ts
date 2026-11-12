import type { GameRepository } from "../../application/ports/index.js";
import type { GameSession } from "../../domain/session/game-session.js";

export class InMemoryGameRepository implements GameRepository {
  private readonly sessions = new Map<string, GameSession>();

  find(gameId: string): GameSession | null {
    return this.sessions.get(gameId) ?? null;
  }

  save(session: GameSession): void {
    this.sessions.set(session.id, session);
  }

  delete(gameId: string): void {
    this.sessions.delete(gameId);
  }
}
