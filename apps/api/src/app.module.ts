import { type DynamicModule, Inject, Injectable, Module, type OnApplicationShutdown } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import type { AppConfig } from "./config.js";
import { HealthController } from "./health/health.controller.js";
import { GameModule } from "./modules/game/index.js";
import { IDENTITY_FOR_GAME, IdentityModule } from "./modules/identity/index.js";
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
    const identity = IdentityModule.register({ secret, secureCookies, allowedOrigins });
    const game = GameModule.register({ imports: [identity], playerIdentity: IDENTITY_FOR_GAME, timing, allowedOrigins, events, database });
    return {
      module: AppModule,
      controllers: [HealthController],
      imports: [identity, game, ...webModules(config.webDir)],
      providers: [{ provide: DATABASE, useValue: database }, DatabaseShutdown],
    };
  }
}
