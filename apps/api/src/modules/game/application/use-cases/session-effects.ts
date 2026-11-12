import type { Clock } from "../../../../shared/clock.js";
import { type Card, cardId } from "../../domain/entities/card.js";
import type { GameSession } from "../../domain/session/game-session.js";
import type { EventBus, PlayJournalEntry } from "../ports/index.js";

export const GAME_NOT_FOUND = "La partida no existe";

export const publishEvents = (session: GameSession, events: EventBus): void => {
  for (const event of session.pullEvents()) events.publish(event.name, { ...event });
};

export const journalEntry = (
  session: GameSession,
  playerId: string,
  action: PlayJournalEntry["action"],
  card: Card | null,
  clock: Clock,
): PlayJournalEntry => ({
  gameId: session.id,
  matchId: session.matchId,
  roundNumber: session.currentRoundNumber,
  playerId,
  seat: session.seatOf(playerId),
  action,
  cardId: card ? cardId(card) : null,
  occurredAt: clock.now(),
});
