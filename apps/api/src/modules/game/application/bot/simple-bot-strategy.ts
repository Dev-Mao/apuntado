import type { PlayerView } from "@apuntado/contracts";
import { type Card, cardId, points } from "../../domain/entities/card.js";
import { findClosure } from "../../domain/services/closure-finder.js";
import { bestArrangement } from "../../domain/services/hand-arranger.js";
import type { BotAction, BotStrategy } from "./bot-strategy.js";

const isSame = (a: Card, b: Card | null): boolean => b !== null && cardId(a) === cardId(b);

const highest = (cards: readonly Card[]): Card | null =>
  cards.reduce<Card | null>((best, c) => (best === null || points(c) > points(best) ? c : best), null);

export class SimpleBotStrategy implements BotStrategy {
  decide(view: PlayerView): BotAction | null {
    if (view.status !== "PLAYING" || view.currentPlayerId !== view.playerId) return null;
    return view.phase === "DRAW" ? this.draw(view) : this.closeOrDiscard(view);
  }

  private draw(view: PlayerView): BotAction {
    const top = view.discardTop;
    return top && this.helps(view, top) ? { kind: "DRAW", source: "DISCARD" } : { kind: "DRAW", source: "STOCK" };
  }

  private helps(view: PlayerView, top: Card): boolean {
    const withTop = [...view.hand, top];
    if (findClosure(withTop, view.enabledClosures, top)) return true;
    return bestArrangement(withTop).melds.some((meld) => meld.some((c) => isSame(c, top)));
  }

  private closeOrDiscard(view: PlayerView): BotAction | null {
    const closure = findClosure(view.hand, view.enabledClosures, view.cannotDiscard);
    if (closure) return { kind: "DECLARE", declaration: closure };
    const allowed = (cards: readonly Card[]) => cards.filter((c) => !isSame(c, view.cannotDiscard));
    const card = highest(allowed(bestArrangement(view.hand).loose)) ?? highest(allowed(view.hand));
    return card ? { kind: "DISCARD", card } : null;
  }
}
