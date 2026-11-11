import type { CardDto, PlayerView } from "@apuntado/contracts";
import type { Card } from "../../domain/entities/card.js";
import type { GameSession } from "../../domain/session/game-session.js";

const toDto = (card: Card): CardDto => ({ rank: card.rank, suit: card.suit });

const toDtoOrNull = (card: Card | null): CardDto | null => (card ? toDto(card) : null);

export const projectPlayerView = (session: GameSession, playerId: string): PlayerView => {
  const round = session.currentRound;
  const isTurnHolder = round.currentPlayerId === playerId;
  return {
    gameId: session.id,
    mode: session.config.mode,
    eliminationThreshold: session.config.eliminationThreshold,
    enabledClosures: session.enabledClosures,
    status: session.currentStatus,
    roundNumber: session.currentRoundNumber,
    playerId,
    hand: round.handOf(playerId).map(toDto),
    cannotDiscard: isTurnHolder ? toDtoOrNull(round.cardTakenFromDiscard) : null,
    opponents: round.playerIds
      .filter((id) => id !== playerId)
      .map((id) => ({ playerId: id, cardCount: round.handOf(id).length })),
    stockSize: round.stockSize,
    discardTop: toDtoOrNull(round.discardTop),
    currentPlayerId: round.currentPlayerId,
    phase: round.currentPhase,
    turnDeadline: session.turnDeadline.toISOString(),
    scoreboard: session.scoreboard,
    lastRound: session.lastRound,
    winnerId: session.winnerId,
  };
};
