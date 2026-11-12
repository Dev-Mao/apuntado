import type { Clock } from "../../../../shared/clock.js";
import type { RandomSource } from "../../../../shared/random.js";
import type { Seat } from "../../domain/room/room.types.js";
import { MAX_PLAYERS, MIN_PLAYERS } from "../../domain/round/round.js";
import { OK, type Outcome, rejected } from "../../domain/round/round.types.js";
import { GameSession } from "../../domain/session/game-session.js";
import type { SessionConfig } from "../../domain/session/game-session.types.js";
import type { MatchStarted } from "../events.js";
import type { EventBus, GameRepository, IdGenerator, StakeGuard } from "../ports/index.js";
import { publishEvents } from "./session-effects.js";

export interface StartGameCommand {
  readonly gameId: string;
  readonly seats: readonly Seat[];
  readonly config: SessionConfig;
  readonly stake: number;
}

export interface StartGameDependencies {
  readonly games: GameRepository;
  readonly random: RandomSource;
  readonly clock: Clock;
  readonly ids: IdGenerator;
  readonly events: EventBus;
  readonly stakes: StakeGuard;
}

const invalidSetup = ({ seats, config }: StartGameCommand): string | null => {
  const playerIds = seats.map((s) => s.playerId);
  if (playerIds.length < MIN_PLAYERS || playerIds.length > MAX_PLAYERS) return "Una partida necesita de 2 a 4 jugadores";
  if (new Set(playerIds).size !== playerIds.length) return "Los jugadores de una partida deben ser distintos";
  if (!Number.isInteger(config.eliminationThreshold) || config.eliminationThreshold < 1) return "El umbral debe ser un entero positivo";
  if (!Number.isInteger(config.turnSeconds) || config.turnSeconds < 1) return "La duración del turno debe ser un entero positivo";
  return null;
};

export class StartGame {
  constructor(private readonly deps: StartGameDependencies) {}

  execute(command: StartGameCommand): Outcome {
    const { games, random, clock, ids, events } = this.deps;
    if (games.find(command.gameId)) return rejected("La partida ya existe");
    const reason = invalidSetup(command);
    if (reason) return rejected(reason);
    const sessionIds = { gameId: command.gameId, matchId: ids.next() };
    const held = this.holdStakes(sessionIds.matchId, command);
    if (!held.ok) return held;
    const session = GameSession.start(sessionIds, command.seats.map((s) => s.playerId), command.config, { random, clock });
    games.save(session);
    const started: MatchStarted = { name: "PartidaIniciada", ...sessionIds, at: clock.now(), config: command.config, stake: command.stake, seats: command.seats };
    events.publish(started.name, { ...started });
    publishEvents(session, events);
    return OK;
  }

  private holdStakes(matchId: string, { seats, stake }: StartGameCommand): Outcome {
    if (stake === 0) return OK;
    if (seats.some((s) => s.isBot)) return rejected("La máquina no juega en mesas con apuesta");
    return this.deps.stakes.hold(matchId, seats.map((s) => s.playerId), stake);
  }
}
