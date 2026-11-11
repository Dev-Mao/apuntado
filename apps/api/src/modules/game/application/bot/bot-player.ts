import type { Clock } from "../../../../shared/clock.js";
import type { Outcome } from "../../domain/round/round.types.js";
import type { GameRepository } from "../ports/index.js";
import type { DeclareClosure } from "../use-cases/declare-closure.js";
import type { DiscardCard } from "../use-cases/discard-card.js";
import type { DrawCard } from "../use-cases/draw-card.js";
import { projectPlayerView } from "../views/player-view-projector.js";
import type { BotAction, BotStrategy } from "./bot-strategy.js";

const MAX_ACTIONS_PER_TURN = 3;

export interface BotUseCases {
  readonly draw: DrawCard;
  readonly discard: DiscardCard;
  readonly declare: DeclareClosure;
}

export class BotPlayer {
  constructor(
    private readonly games: GameRepository,
    private readonly strategy: BotStrategy,
    private readonly useCases: BotUseCases,
    private readonly clock: Clock,
  ) {}

  playTurn(gameId: string, botId: string): void {
    for (let step = 0; step < MAX_ACTIONS_PER_TURN; step++) {
      const session = this.games.find(gameId);
      if (!session) return;
      const action = this.strategy.decide(projectPlayerView(session, botId, this.clock.now()));
      if (!action || !this.perform(gameId, botId, action).ok) return;
    }
  }

  private perform(gameId: string, playerId: string, action: BotAction): Outcome {
    if (action.kind === "DRAW") return this.useCases.draw.execute({ gameId, playerId, source: action.source });
    if (action.kind === "DISCARD") return this.useCases.discard.execute({ gameId, playerId, card: action.card });
    const result = this.useCases.declare.execute({ gameId, playerId, declaration: action.declaration });
    return result.valid ? { ok: true } : { ok: false, reason: result.reason ?? "" };
  }
}
