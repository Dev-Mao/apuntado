import { type DynamicModule, Module } from "@nestjs/common";
import type { Database } from "../../shared/database/database.js";
import { RandomIds } from "../../shared/ids.js";
import { OriginPolicy } from "../../shared/origin-policy.js";
import { ReadSession } from "./application/read-session.js";
import { StartGuestSession } from "./application/start-guest-session.js";
import { GameIdentityAdapter } from "./infrastructure/game-identity-adapter.js";
import { JwtSessionTokens } from "./infrastructure/jwt-session-tokens.js";
import { PgPlayerRegistry } from "./infrastructure/pg-player-registry.js";
import { UnrecordedPlayers } from "./infrastructure/unrecorded-players.js";
import { SessionController } from "./interfaces/http/session.controller.js";
import { ORIGIN_POLICY, READ_SESSION, SECURE_COOKIES, START_GUEST_SESSION } from "./interfaces/http/tokens.js";

export const IDENTITY_FOR_GAME = Symbol("IDENTITY_FOR_GAME");

export interface IdentityOptions {
  readonly secret: string;
  readonly secureCookies: boolean;
  readonly allowedOrigins: readonly string[];
  readonly database: Database | null;
}

@Module({})
export class IdentityModule {
  static register(options: IdentityOptions): DynamicModule {
    const tokens = new JwtSessionTokens(options.secret);
    const readSession = new ReadSession(tokens);
    const players = options.database ? new PgPlayerRegistry(options.database) : new UnrecordedPlayers();
    return {
      module: IdentityModule,
      controllers: [SessionController],
      providers: [
        { provide: START_GUEST_SESSION, useValue: new StartGuestSession(tokens, new RandomIds(), players) },
        { provide: READ_SESSION, useValue: readSession },
        { provide: SECURE_COOKIES, useValue: options.secureCookies },
        { provide: ORIGIN_POLICY, useValue: new OriginPolicy(options.allowedOrigins) },
        { provide: IDENTITY_FOR_GAME, useValue: new GameIdentityAdapter(readSession) },
      ],
      exports: [IDENTITY_FOR_GAME],
    };
  }
}
