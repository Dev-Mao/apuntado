import type { Clock } from "../../../../shared/clock.js";
import { type Outcome, rejected } from "../../domain/round/round.types.js";
import type { GameSession } from "../../domain/session/game-session.js";
import type { EventBus, GameRepository, PlayJournal } from "../ports/index.js";
import { GAME_NOT_FOUND, journalEntry, publishEvents } from "./session-effects.js";

export class TimeOutTurn {
  constructor(
    private readonly games: GameRepository,
    private readonly journal: PlayJournal,
    private readonly events: EventBus,
    private readonly clock: Clock,
  ) {}

  execute(gameId: string): Outcome {
    const session = this.games.find(gameId);
    if (!session) return rejected(GAME_NOT_FOUND);
    if (session.currentStatus !== "PLAYING") return rejected("No hay una ronda en juego");
    if (!session.isTurnExpired()) return rejected("El turno todavía no ha vencido");
    const playerId = session.currentRound.currentPlayerId;
    const drewAutomatically = session.currentRound.currentPhase === "DRAW";
    const outcome = session.timeOut(playerId);
    if (!outcome.ok) return outcome;
    if (session.currentStatus === "PLAYING") this.journalAutomaticPlay(session, playerId, drewAutomatically);
    this.games.save(session);
    publishEvents(session, this.events);
    return outcome;
  }

  private journalAutomaticPlay(session: GameSession, playerId: string, drewAutomatically: boolean): void {
    const discarded = session.currentRound.discardTop;
    if (drewAutomatically) this.journal.record(journalEntry(session, playerId, "ROBAR_MAZO", discarded, this.clock));
    this.journal.record(journalEntry(session, playerId, "DESCARTAR", discarded, this.clock));
  }
}
