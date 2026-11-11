import { type DynamicModule, Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import type { AppConfig } from "./config.js";
import { GameModule } from "./modules/game/index.js";
import { IDENTITY_FOR_GAME, IdentityModule } from "./modules/identity/index.js";

const webModules = (webDir: string | null): DynamicModule[] =>
  webDir
    ? [ServeStaticModule.forRoot({ rootPath: webDir, exclude: ["/api/{*path}"], serveStaticOptions: { extensions: ["html"] } })]
    : [];

@Module({})
export class AppModule {
  static register(config: AppConfig): DynamicModule {
    const identity = IdentityModule.register({ secret: config.sessionSecret, secureCookies: config.secureCookies });
    const game = GameModule.register({ imports: [identity], playerIdentity: IDENTITY_FOR_GAME, timing: config.timing });
    return { module: AppModule, imports: [identity, game, ...webModules(config.webDir)] };
  }
}
