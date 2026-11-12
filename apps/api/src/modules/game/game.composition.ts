import type { Clock } from "../../shared/clock.js";
import type { RandomSource } from "../../shared/random.js";
import { BotPlayer } from "./application/bot/bot-player.js";
import { SimpleBotStrategy } from "./application/bot/simple-bot-strategy.js";
import type { EventBus, IdGenerator, PlayJournal, Presence, StakeGuard, TableNotifier, TaskScheduler } from "./application/ports/index.js";
import { LobbyCommands } from "./application/table/lobby-commands.js";
import { TableCommands } from "./application/table/table-commands.js";
import { TableCoordinator, type TableTiming } from "./application/table/table-coordinator.js";
import { TableQueries } from "./application/table/table-queries.js";
import { DeclareClosure } from "./application/use-cases/declare-closure.js";
import { DiscardCard } from "./application/use-cases/discard-card.js";
import { DrawCard } from "./application/use-cases/draw-card.js";
import { StartGame } from "./application/use-cases/start-game.js";
import { StartNextRound } from "./application/use-cases/start-next-round.js";
import { TimeOutTurn } from "./application/use-cases/time-out-turn.js";
import { RuleResolver } from "./domain/rules/rule-resolver.js";
import { InMemoryGameRepository } from "./infrastructure/repositories/in-memory-game-repository.js";
import { InMemoryRoomRepository } from "./infrastructure/repositories/in-memory-room-repository.js";

export interface GameInfrastructure {
  readonly clock: Clock;
  readonly random: RandomSource;
  readonly ids: IdGenerator;
  readonly scheduler: TaskScheduler;
  readonly notifier: TableNotifier;
  readonly presence: Presence;
  readonly journal: PlayJournal;
  readonly events: EventBus;
  readonly stakes: StakeGuard;
  readonly timing: TableTiming;
}

export interface GameComponents {
  readonly lobby: LobbyCommands;
  readonly table: TableCommands;
  readonly queries: TableQueries;
}

export const composeGame = (infra: GameInfrastructure): GameComponents => {
  const { clock, random, ids, scheduler, notifier, presence, journal, events, stakes, timing } = infra;
  const games = new InMemoryGameRepository();
  const rooms = new InMemoryRoomRepository();
  const draw = new DrawCard(games, journal, events, clock);
  const discard = new DiscardCard(games, journal, events, clock);
  const declare = new DeclareClosure(games, new RuleResolver(), journal, events, clock);
  const nextRound = new StartNextRound(games, events);
  const bot = new BotPlayer(games, new SimpleBotStrategy(), { draw, discard, declare }, clock);
  const timeOut = new TimeOutTurn(games, journal, events, clock);
  const coordinator = new TableCoordinator({ games, rooms, notifier, scheduler, presence, clock, timeOut, nextRound, bot, timing });
  const startGame = new StartGame({ games, random, clock, ids, events, stakes });
  return {
    lobby: new LobbyCommands({ rooms, startGame, coordinator, notifier, random, stakes }),
    table: new TableCommands({ rooms, draw, discard, declare, coordinator }),
    queries: new TableQueries(rooms, games, presence, clock),
  };
};
