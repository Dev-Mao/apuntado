import type { PlayerView } from "@apuntado/contracts";
import type { Card } from "../../domain/entities/card.js";
import type { ClosureDeclaration } from "../../domain/rules/game-rule.js";

export type BotAction =
  | { readonly kind: "DRAW"; readonly source: "STOCK" | "DISCARD" }
  | { readonly kind: "DISCARD"; readonly card: Card }
  | { readonly kind: "DECLARE"; readonly declaration: ClosureDeclaration };

export interface BotStrategy {
  decide(view: PlayerView): BotAction | null;
}
