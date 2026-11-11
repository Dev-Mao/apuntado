import { type Outcome, rejected } from "../../domain/round/round.types.js";
import type { GameRepository } from "../ports/index.js";
import { GAME_NOT_FOUND } from "./session-effects.js";

export class StartNextRound {
  constructor(private readonly games: GameRepository) {}

  execute(gameId: string): Outcome {
    const session = this.games.find(gameId);
    if (!session) return rejected(GAME_NOT_FOUND);
    const outcome = session.startNextRound();
    if (outcome.ok) this.games.save(session);
    return outcome;
  }
}
