import { type Outcome, rejected } from "../../domain/round/round.types.js";
import type { EventBus, GameRepository } from "../ports/index.js";
import { GAME_NOT_FOUND, publishEvents } from "./session-effects.js";

export class StartNextRound {
  constructor(
    private readonly games: GameRepository,
    private readonly events: EventBus,
  ) {}

  execute(gameId: string): Outcome {
    const session = this.games.find(gameId);
    if (!session) return rejected(GAME_NOT_FOUND);
    const outcome = session.startNextRound();
    if (!outcome.ok) return outcome;
    this.games.save(session);
    publishEvents(session, this.events);
    return outcome;
  }
}
