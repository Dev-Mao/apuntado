import { cardId } from "@/lib";

import type { PlayerView } from "@apuntado/contracts";

const DEAL_HAND_SIZE = 10;
const DECK_SIZE = 52;

export interface MotionFrame {
  readonly round: number;
  readonly hand: readonly string[];
  readonly discardId: string | null;
  readonly stockSize: number;
  readonly counts: ReadonlyMap<string, number>;
}

export type MotionEvent =
  | { readonly kind: "deal" }
  | { readonly kind: "selfDraw"; readonly ids: readonly string[]; readonly fromDiscard: boolean }
  | { readonly kind: "selfDiscard"; readonly id: string }
  | { readonly kind: "rivalDraw"; readonly playerId: string; readonly fromDiscard: boolean }
  | { readonly kind: "rivalDiscard"; readonly playerId: string };

export function frameOf(view: PlayerView): MotionFrame {
  return {
    round: view.roundNumber,
    hand: view.hand.map(cardId),
    discardId: view.discardTop ? cardId(view.discardTop) : null,
    stockSize: view.stockSize,
    counts: new Map(view.opponents.map((opponent) => [opponent.playerId, opponent.cardCount])),
  };
}

function selfEvents(prev: MotionFrame, next: MotionFrame): MotionEvent[] {
  const added = next.hand.filter((id) => !prev.hand.includes(id));
  const removed = prev.hand.filter((id) => !next.hand.includes(id));
  const events: MotionEvent[] = [];
  if (added.length > 0) {
    events.push({ kind: "selfDraw", ids: added, fromDiscard: prev.discardId !== null && added.includes(prev.discardId) });
  }
  const [discarded] = removed;
  if (removed.length === 1 && discarded !== undefined && discarded === next.discardId) {
    events.push({ kind: "selfDiscard", id: discarded });
  }
  return events;
}

function rivalEvents(prev: MotionFrame, next: MotionFrame): MotionEvent[] {
  const events: MotionEvent[] = [];
  next.counts.forEach((count, playerId) => {
    const before = prev.counts.get(playerId) ?? count;
    if (count > before) events.push({ kind: "rivalDraw", playerId, fromDiscard: next.stockSize >= prev.stockSize });
    if (count < before && next.discardId !== prev.discardId) events.push({ kind: "rivalDiscard", playerId });
  });
  return events;
}

function isFreshDeal(frame: MotionFrame): boolean {
  const players = frame.counts.size + 1;
  const opponentsUntouched = Array.from(frame.counts.values()).every((count) => count === DEAL_HAND_SIZE);
  return frame.hand.length === DEAL_HAND_SIZE && opponentsUntouched && frame.stockSize === DECK_SIZE - players * DEAL_HAND_SIZE - 1;
}

export function eventsBetween(prev: MotionFrame | null, next: MotionFrame): MotionEvent[] {
  if (!prev) return isFreshDeal(next) ? [{ kind: "deal" }] : [];
  if (prev.round !== next.round) return [{ kind: "deal" }];
  return [...selfEvents(prev, next), ...rivalEvents(prev, next)];
}
