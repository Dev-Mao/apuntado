import type { Clock } from "../../../../shared/clock.js";
import type { RandomSource } from "../../../../shared/random.js";
import { OK, type Outcome, rejected } from "../../domain/round/round.types.js";
import { GameSession } from "../../domain/session/game-session.js";
import type { SessionConfig } from "../../domain/session/game-session.types.js";
import type { GameRepository } from "../ports/index.js";

export interface StartGameCommand {
  readonly gameId: string;
  readonly playerIds: readonly string[];
  readonly config: SessionConfig;
}

export class StartGame {
  constructor(
    private readonly games: GameRepository,
    private readonly random: RandomSource,
    private readonly clock: Clock,
  ) {}

  execute(command: StartGameCommand): Outcome {
    if (this.games.find(command.gameId)) return rejected("La partida ya existe");
    const session = GameSession.start(command.gameId, command.playerIds, command.config, {
      random: this.random,
      clock: this.clock,
    });
    this.games.save(session);
    return OK;
  }
}
