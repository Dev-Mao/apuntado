import type { CardDto, PlayerAction, PlayerView, RoundResultView } from "@apuntado/contracts";
import type { Card } from "../../domain/entities/card.js";
import type { GameSession } from "../../domain/session/game-session.js";

const toDto = (card: Card): CardDto => ({ rank: card.rank, suit: card.suit });

const toDtoOrNull = (card: Card | null): CardDto | null => (card ? toDto(card) : null);

const allowedActions = (session: GameSession, playerId: string): PlayerAction[] => {
  const round = session.currentRound;
  if (session.currentStatus !== "PLAYING" || round.currentPlayerId !== playerId) return [];
  return round.currentPhase === "DRAW" ? ["DRAW_STOCK", "DRAW_DISCARD"] : ["DISCARD", "DECLARE_CLOSURE"];
};

const lastRound = (session: GameSession): RoundResultView | null => {
  const summary = session.lastRound;
  if (!summary) return null;
  return {
    roundNumber: summary.roundNumber,
    roundWinnerId: summary.winnerId,
    closureType: summary.closureType,
    scores: summary.scores,
  };
};

export const projectPlayerView = (session: GameSession, playerId: string, now: Date): PlayerView => {
  const round = session.currentRound;
  const playing = session.currentStatus === "PLAYING";
  const isTurnHolder = playing && round.currentPlayerId === playerId;
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
    allowedActions: allowedActions(session, playerId),
    opponents: round.playerIds
      .filter((id) => id !== playerId)
      .map((id) => ({ playerId: id, cardCount: round.handOf(id).length })),
    stockSize: round.stockSize,
    discardTop: toDtoOrNull(round.discardTop),
    currentPlayerId: playing ? round.currentPlayerId : null,
    phase: playing ? round.currentPhase : null,
    turnDeadline: playing ? session.turnDeadline.toISOString() : null,
    serverTime: now.toISOString(),
    scoreboard: session.scoreboard,
    lastRound: lastRound(session),
    winnerId: session.winnerId,
  };
};
