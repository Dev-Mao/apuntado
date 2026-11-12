import { cardId, cardVisualOf, fly, placementOf } from "@/lib";

import type { MotionEvent } from "./motion-events";
import type { Placement } from "@/lib";
import type { PlayerView } from "@apuntado/contracts";

const DEAL_STAGGER_MS = 55;

type Pile = "stock" | "discard";

export type HandPlacements = ReadonlyMap<string, Placement>;

function find(selector: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(selector);
}

function handCard(id: string): HTMLElement | null {
  return cardVisualOf(find(`[data-card-id="${CSS.escape(id)}"]`));
}

function pileTop(pile: Pile): HTMLElement | null {
  return cardVisualOf(find(`[data-pile-top="${pile}"]`));
}

function pileAnchor(pile: Pile): HTMLElement | null {
  return find(`[data-pile="${pile}"]`);
}

function seatCards(playerId: string): HTMLElement[] {
  const fan = find(`[data-seat-fan="${CSS.escape(playerId)}"]`);
  return fan ? Array.from(fan.querySelectorAll<HTMLElement>("[data-card-visual]")) : [];
}

export function measureHand(): HandPlacements {
  const placements = new Map<string, Placement>();
  document.querySelectorAll<HTMLElement>("[data-card-id]").forEach((button) => {
    const visual = cardVisualOf(button);
    const id = button.dataset.cardId;
    if (visual && id) placements.set(id, placementOf(visual));
  });
  return placements;
}

function dealTargets(view: PlayerView): HTMLElement[][] {
  const rivals = view.opponents.map((opponent) => seatCards(opponent.playerId));
  const mine = view.hand.flatMap((card) => handCard(cardId(card)) ?? []);
  return [...rivals, mine];
}

function playDeal(view: PlayerView) {
  const stock = pileTop("stock");
  if (!stock) return;
  const from = placementOf(stock);
  const seats = dealTargets(view);
  const rounds = Math.max(0, ...seats.map((cards) => cards.length));
  const mineIndex = seats.length - 1;
  for (let round = 0; round < rounds; round += 1) {
    seats.forEach((cards, seat) => {
      const target = cards[round];
      if (!target) return;
      const delay = (round * seats.length + seat) * DEAL_STAGGER_MS;
      fly({ from, target, back: seat === mineIndex ? stock : null, delay });
    });
  }
}

function playSelfDraw(ids: readonly string[], fromDiscard: boolean) {
  const anchor = pileAnchor(fromDiscard ? "discard" : "stock");
  if (!anchor) return;
  const from = placementOf(anchor);
  const back = fromDiscard ? null : pileTop("stock");
  ids.forEach((id) => {
    const target = handCard(id);
    if (target) fly({ from, target, back });
  });
}

function playSelfDiscard(id: string, hand: HandPlacements) {
  const from = hand.get(id);
  const target = pileTop("discard");
  if (from && target) fly({ from, target });
}

function playRivalDraw(playerId: string, fromDiscard: boolean) {
  const anchor = pileAnchor(fromDiscard ? "discard" : "stock");
  const target = seatCards(playerId).at(-1);
  if (anchor && target) fly({ from: placementOf(anchor), target });
}

function playRivalDiscard(playerId: string) {
  const seat = seatCards(playerId).at(-1) ?? null;
  const target = pileTop("discard");
  if (seat && target) fly({ from: placementOf(seat), target, back: seat });
}

function playEvent(event: MotionEvent, view: PlayerView, hand: HandPlacements) {
  if (event.kind === "deal") return playDeal(view);
  if (event.kind === "selfDraw") return playSelfDraw(event.ids, event.fromDiscard);
  if (event.kind === "selfDiscard") return playSelfDiscard(event.id, hand);
  if (event.kind === "rivalDraw") return playRivalDraw(event.playerId, event.fromDiscard);
  return playRivalDiscard(event.playerId);
}

export function playEvents(events: readonly MotionEvent[], view: PlayerView, hand: HandPlacements) {
  events.forEach((event) => playEvent(event, view, hand));
}
