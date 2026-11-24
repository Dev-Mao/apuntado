import { type Outcome, rejected } from "../../domain/round/round.types.js";
import type { EventBus, GameRepository, RoomRepository } from "../ports/index.js";
import { GAME_NOT_FOUND, publishEvents } from "./session-effects.js";

export interface AbandonGameCommand {
  readonly gameId: string;
  readonly playerId: string;
}

export class AbandonGame {
  constructor(
    private readonly games: GameRepository,
    private readonly rooms: RoomRepository,
    private readonly events: EventBus,
  ) {}

  execute({ gameId, playerId }: AbandonGameCommand): Outcome {
    const session = this.games.find(gameId);
    const room = this.rooms.find(gameId);
    if (!session || !room) return rejected(GAME_NOT_FOUND);
    const departed = room.depart(playerId);
    if (!departed.ok) return departed;
    const outcome = session.abandon(playerId);
    if (!outcome.ok) return outcome;
    const humanInPlay = room.humanIds.some((id) => !session.isEliminated(id));
    if (!humanInPlay) session.concludeByBest();
    this.rooms.save(room);
    this.games.save(session);
    publishEvents(session, this.events);
    return outcome;
  }
}
