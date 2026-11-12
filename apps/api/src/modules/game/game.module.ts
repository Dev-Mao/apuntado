import { type DynamicModule, Inject, Injectable, type InjectionToken, Logger, Module, type ModuleMetadata, type OnModuleDestroy } from "@nestjs/common";
import { SystemClock } from "../../shared/clock.js";
import { InProcessEventBus } from "../../shared/in-process-event-bus.js";
import { OriginPolicy } from "../../shared/origin-policy.js";
import { SystemRandom } from "../../shared/random.js";
import type { TableTiming } from "./application/table/table-coordinator.js";
import { composeGame } from "./game.composition.js";
import { InMemoryPlayJournal } from "./infrastructure/journal/in-memory-play-journal.js";
import { TimeoutScheduler } from "./infrastructure/timers/timeout-scheduler.js";
import { SocketRegistry } from "./interfaces/realtime/socket-registry.js";
import { SocketTableNotifier } from "./interfaces/realtime/socket-table-notifier.js";
import { TableGateway } from "./interfaces/realtime/table.gateway.js";
import { GAME_COMPONENTS, ORIGIN_POLICY, PLAYER_IDENTITY, SOCKET_REGISTRY, TABLE_NOTIFIER } from "./interfaces/realtime/tokens.js";

export interface GameModuleOptions {
  readonly imports: NonNullable<ModuleMetadata["imports"]>;
  readonly playerIdentity: InjectionToken;
  readonly timing: TableTiming;
  readonly allowedOrigins: readonly string[];
}

const SCHEDULER = Symbol("SCHEDULER");

@Injectable()
class SchedulerShutdown implements OnModuleDestroy {
  constructor(@Inject(SCHEDULER) private readonly scheduler: TimeoutScheduler) {}

  onModuleDestroy(): void {
    this.scheduler.cancelAll();
  }
}

@Module({})
export class GameModule {
  static register(options: GameModuleOptions): DynamicModule {
    const clock = new SystemClock();
    const logger = new Logger("GameTimers");
    const scheduler = new TimeoutScheduler(clock, (error) => logger.error(error));
    const registry = new SocketRegistry();
    const notifier = new SocketTableNotifier(registry);
    const components = composeGame({
      clock,
      random: new SystemRandom(),
      scheduler,
      notifier,
      presence: registry,
      journal: new InMemoryPlayJournal(),
      events: new InProcessEventBus(),
      timing: options.timing,
    });
    notifier.connect(components.queries);
    return {
      module: GameModule,
      imports: options.imports,
      providers: [
        { provide: GAME_COMPONENTS, useValue: components },
        { provide: SOCKET_REGISTRY, useValue: registry },
        { provide: TABLE_NOTIFIER, useValue: notifier },
        { provide: SCHEDULER, useValue: scheduler },
        { provide: ORIGIN_POLICY, useValue: new OriginPolicy(options.allowedOrigins) },
        { provide: PLAYER_IDENTITY, useExisting: options.playerIdentity },
        SchedulerShutdown,
        TableGateway,
      ],
    };
  }
}
