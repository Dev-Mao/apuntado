import { type DynamicModule, Module } from "@nestjs/common";
import { RandomIds } from "../../shared/ids.js";
import { OriginPolicy } from "../../shared/origin-policy.js";
import { ReadSession } from "./application/read-session.js";
import { StartGuestSession } from "./application/start-guest-session.js";
import { GameIdentityAdapter } from "./infrastructure/game-identity-adapter.js";
import { JwtSessionTokens } from "./infrastructure/jwt-session-tokens.js";
import { SessionController } from "./interfaces/http/session.controller.js";
import { ORIGIN_POLICY, READ_SESSION, SECURE_COOKIES, START_GUEST_SESSION } from "./interfaces/http/tokens.js";

export const IDENTITY_FOR_GAME = Symbol("IDENTITY_FOR_GAME");

export interface IdentityOptions {
  readonly secret: string;
  readonly secureCookies: boolean;
  readonly allowedOrigins: readonly string[];
}

@Module({})
export class IdentityModule {
  static register(options: IdentityOptions): DynamicModule {
    const tokens = new JwtSessionTokens(options.secret);
    const readSession = new ReadSession(tokens);
    return {
      module: IdentityModule,
      controllers: [SessionController],
      providers: [
        { provide: START_GUEST_SESSION, useValue: new StartGuestSession(tokens, new RandomIds()) },
        { provide: READ_SESSION, useValue: readSession },
        { provide: SECURE_COOKIES, useValue: options.secureCookies },
        { provide: ORIGIN_POLICY, useValue: new OriginPolicy(options.allowedOrigins) },
        { provide: IDENTITY_FOR_GAME, useValue: new GameIdentityAdapter(readSession) },
      ],
      exports: [IDENTITY_FOR_GAME],
    };
  }
}
