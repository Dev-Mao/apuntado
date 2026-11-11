import type { GameRepository, GameSnapshot } from "../../application/ports/index.js";

export class InMemoryGameRepository implements GameRepository {
  private readonly games = new Map<string, GameSnapshot>();

  find(gameId: string): GameSnapshot | null {
    return this.games.get(gameId) ?? null;
  }

  save(snapshot: GameSnapshot): void {
    this.games.set(snapshot.gameId, snapshot);
  }
}
