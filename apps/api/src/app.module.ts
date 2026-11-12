import { type DynamicModule, Inject, Injectable, Module, type OnApplicationShutdown } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import type { AppConfig } from "./config.js";
import { HealthController } from "./health/health.controller.js";
import { composeEconomy, EconomyModule } from "./modules/economy/index.js";
import { GameModule } from "./modules/game/index.js";
import { HistoryModule } from "./modules/history/index.js";
import { IDENTITY_FOR_MODULES, IdentityModule } from "./modules/identity/index.js";
import { closeDatabase, type Database } from "./shared/database/database.js";
import { InProcessEventBus } from "./shared/in-process-event-bus.js";

const DATABASE = Symbol("DATABASE");

@Injectable()
class DatabaseShutdown implements OnApplicationShutdown {
  constructor(@Inject(DATABASE) private readonly database: Database | null) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.database) await closeDatabase(this.database);
  }
}

const webModules = (webDir: string | null): DynamicModule[] =>
  webDir
    ? [ServeStaticModule.forRoot({ rootPath: webDir, exclude: ["/api/{*path}"], serveStaticOptions: { extensions: ["html"] } })]
    : [];

@Module({})
export class AppModule {
  static register(config: AppConfig, database: Database | null = null): DynamicModule {
    const { sessionSecret: secret, secureCookies, allowedOrigins, timing } = config;
    const events = new InProcessEventBus();
    const playerIdentity = IDENTITY_FOR_MODULES;
    const identity = IdentityModule.register({ secret, secureCookies, allowedOrigins, database, events });
    const history = HistoryModule.register({ imports: [identity], playerIdentity, events, database });
    const economy = composeEconomy(database, events);
    const wallet = EconomyModule.register({ imports: [identity], playerIdentity, economy });
    const game = GameModule.register({ imports: [identity], playerIdentity, timing, allowedOrigins, events, stakes: economy.stakes, database });
    return {
      module: AppModule,
      controllers: [HealthController],
      imports: [identity, history, wallet, game, ...webModules(config.webDir)],
      providers: [{ provide: DATABASE, useValue: database }, DatabaseShutdown],
    };
  }
}
