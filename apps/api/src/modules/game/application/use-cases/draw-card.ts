import type { Clock } from "../../../../shared/clock.js";
import { type Outcome, rejected } from "../../domain/round/round.types.js";
import type { EventBus, GameRepository, PlayJournal } from "../ports/index.js";
import { GAME_NOT_FOUND, journalEntry, publishEvents } from "./session-effects.js";

export interface DrawCardCommand {
  readonly gameId: string;
  readonly playerId: string;
  readonly source: "STOCK" | "DISCARD";
}

export class DrawCard {
  constructor(
    private readonly games: GameRepository,
    private readonly journal: PlayJournal,
    private readonly events: EventBus,
    private readonly clock: Clock,
  ) {}

  execute({ gameId, playerId, source }: DrawCardCommand): Outcome {
    const session = this.games.find(gameId);
    if (!session) return rejected(GAME_NOT_FOUND);
    const outcome = source === "STOCK" ? session.drawFromStock(playerId) : session.drawFromDiscard(playerId);
    if (!outcome.ok) return outcome;
    if (session.currentStatus === "PLAYING") {
      const drawn = session.currentRound.handOf(playerId).at(-1) ?? null;
      const action = source === "STOCK" ? "ROBAR_MAZO" : "ROBAR_POZO";
      this.journal.record(journalEntry(session, playerId, action, drawn, this.clock));
    }
    this.games.save(session);
    publishEvents(session, this.events);
    return outcome;
  }
}
