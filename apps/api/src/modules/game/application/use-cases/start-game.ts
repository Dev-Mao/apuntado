import type { Clock } from "../../../../shared/clock.js";
import type { RandomSource } from "../../../../shared/random.js";
import { MAX_PLAYERS, MIN_PLAYERS } from "../../domain/round/round.js";
import { OK, type Outcome, rejected } from "../../domain/round/round.types.js";
import { GameSession } from "../../domain/session/game-session.js";
import type { SessionConfig } from "../../domain/session/game-session.types.js";
import type { GameRepository } from "../ports/index.js";

export interface StartGameCommand {
  readonly gameId: string;
  readonly playerIds: readonly string[];
  readonly config: SessionConfig;
}

const invalidSetup = ({ playerIds, config }: StartGameCommand): string | null => {
  if (playerIds.length < MIN_PLAYERS || playerIds.length > MAX_PLAYERS) return "Una partida necesita de 2 a 4 jugadores";
  if (new Set(playerIds).size !== playerIds.length) return "Los jugadores de una partida deben ser distintos";
  if (!Number.isInteger(config.eliminationThreshold) || config.eliminationThreshold < 1) return "El umbral debe ser un entero positivo";
  if (!Number.isInteger(config.turnSeconds) || config.turnSeconds < 1) return "La duración del turno debe ser un entero positivo";
  return null;
};

export class StartGame {
  constructor(
    private readonly games: GameRepository,
    private readonly random: RandomSource,
    private readonly clock: Clock,
  ) {}

  execute(command: StartGameCommand): Outcome {
    if (this.games.find(command.gameId)) return rejected("La partida ya existe");
    const reason = invalidSetup(command);
    if (reason) return rejected(reason);
    const session = GameSession.start(command.gameId, command.playerIds, command.config, {
      random: this.random,
      clock: this.clock,
    });
    this.games.save(session);
    return OK;
  }
}
