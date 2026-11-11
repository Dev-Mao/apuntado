import type { Clock } from "../../../../shared/clock.js";
import type { Card } from "../../domain/entities/card.js";
import { type Outcome, rejected } from "../../domain/round/round.types.js";
import type { EventBus, GameRepository, PlayJournal } from "../ports/index.js";
import { GAME_NOT_FOUND, journalEntry, publishEvents } from "./session-effects.js";

export interface DiscardCardCommand {
  readonly gameId: string;
  readonly playerId: string;
  readonly card: Card;
}

export class DiscardCard {
  constructor(
    private readonly games: GameRepository,
    private readonly journal: PlayJournal,
    private readonly events: EventBus,
    private readonly clock: Clock,
  ) {}

  execute({ gameId, playerId, card }: DiscardCardCommand): Outcome {
    const session = this.games.find(gameId);
    if (!session) return rejected(GAME_NOT_FOUND);
    const outcome = session.discard(playerId, card);
    if (!outcome.ok) return outcome;
    this.journal.record(journalEntry(session, playerId, "DESCARTAR", card, this.clock));
    this.games.save(session);
    publishEvents(session, this.events);
    return outcome;
  }
}
