import type { GameRepository, GameSnapshot } from "../../application/ports/index.js";

/**
 * La partida en curso vive en memoria del servidor (trade-off T3 del Entregable 1).
 * Detrás de un puerto: migrar a Redis o a snapshot persistente es cambiar esta clase.
 */
export class InMemoryGameRepository implements GameRepository {
  private readonly games = new Map<string, GameSnapshot>();

  find(gameId: string): GameSnapshot | null {
    return this.games.get(gameId) ?? null;
  }

  save(snapshot: GameSnapshot): void {
    this.games.set(snapshot.gameId, snapshot);
  }
}
