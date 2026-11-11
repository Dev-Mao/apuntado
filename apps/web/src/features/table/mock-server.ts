import { cardId } from "@/lib";

import { MOCK_DISCARD_ACTIONS, MOCK_DRAW_ACTIONS, MOCK_STOCK_DRAWS, MOCK_UNDER_DISCARD } from "./mock-data";

import type { CardDto, PlayerView } from "@apuntado/contracts";

const MOCK_TURN_MS = 60_000;

const iso = (time: number) => new Date(time).toISOString();

function sameCard(a: CardDto | null, b: CardDto): boolean {
  return a !== null && cardId(a) === cardId(b);
}

function isInPlay(view: PlayerView, card: CardDto): boolean {
  return view.hand.some((held) => sameCard(held, card)) || sameCard(view.discardTop, card);
}

function takeCard(view: PlayerView, card: CardDto, changes: Partial<PlayerView>, now: number): PlayerView {
  return {
    ...view,
    ...changes,
    hand: [...view.hand, card],
    phase: "DISCARD",
    allowedActions: MOCK_DISCARD_ACTIONS,
    serverTime: iso(now),
  };
}

export function startTurn(view: PlayerView, playerId: string, now: number): PlayerView {
  return {
    ...view,
    currentPlayerId: playerId,
    phase: "DRAW",
    cannotDiscard: null,
    allowedActions: playerId === view.playerId ? MOCK_DRAW_ACTIONS : [],
    turnDeadline: iso(now + MOCK_TURN_MS),
    serverTime: iso(now),
  };
}

export function drawFromStock(view: PlayerView, now: number): PlayerView {
  const card = MOCK_STOCK_DRAWS.find((candidate) => !isInPlay(view, candidate));
  return card ? takeCard(view, card, { stockSize: view.stockSize - 1 }, now) : view;
}

export function drawFromDiscard(view: PlayerView, now: number): PlayerView {
  const top = view.discardTop;
  if (!top) return view;
  const next = isInPlay(view, MOCK_UNDER_DISCARD) ? null : MOCK_UNDER_DISCARD;
  return takeCard(view, top, { discardTop: next, cannotDiscard: top }, now);
}

export function discard(view: PlayerView, card: CardDto, now: number): PlayerView {
  if (sameCard(view.cannotDiscard, card)) return view;
  const next = view.opponents[0]?.playerId ?? view.playerId;
  return startTurn({ ...view, hand: view.hand.filter((held) => !sameCard(held, card)), discardTop: card }, next, now);
}

export function returnTurn(view: PlayerView, now: number): PlayerView {
  return view.currentPlayerId === view.playerId ? view : startTurn(view, view.playerId, now);
}

export function endRound(view: PlayerView, now: number): PlayerView {
  return {
    ...view,
    status: "ROUND_OVER",
    currentPlayerId: null,
    phase: null,
    cannotDiscard: null,
    allowedActions: [],
    turnDeadline: null,
    serverTime: iso(now),
  };
}
