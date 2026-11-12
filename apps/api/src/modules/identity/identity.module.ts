import { type DynamicModule, Module } from "@nestjs/common";
import type { Database } from "../../shared/database/database.js";
import { RandomIds } from "../../shared/ids.js";
import { OriginPolicy } from "../../shared/origin-policy.js";
import { LogIn } from "./application/log-in.js";
import type { EventPublisher } from "./application/ports.js";
import { ReadSession } from "./application/read-session.js";
import { RegisterAccount } from "./application/register-account.js";
import { StartGuestSession } from "./application/start-guest-session.js";
import { Argon2PasswordHasher } from "./infrastructure/argon2-password-hasher.js";
import { GameIdentityAdapter } from "./infrastructure/game-identity-adapter.js";
import { JwtSessionTokens } from "./infrastructure/jwt-session-tokens.js";
import { PgAccountStore } from "./infrastructure/pg-account-store.js";
import { PgPlayerRegistry } from "./infrastructure/pg-player-registry.js";
import { UnavailableAccounts } from "./infrastructure/unavailable-accounts.js";
import { UnrecordedPlayers } from "./infrastructure/unrecorded-players.js";
import { AccountController } from "./interfaces/http/account.controller.js";
import { SessionController } from "./interfaces/http/session.controller.js";
import { LOG_IN, ORIGIN_POLICY, READ_SESSION, REGISTER_ACCOUNT, SECURE_COOKIES, START_GUEST_SESSION } from "./interfaces/http/tokens.js";

export const IDENTITY_FOR_MODULES = Symbol("IDENTITY_FOR_MODULES");

export interface IdentityOptions {
  readonly secret: string;
  readonly secureCookies: boolean;
  readonly allowedOrigins: readonly string[];
  readonly database: Database | null;
  readonly events: EventPublisher;
}

@Module({})
export class IdentityModule {
  static register(options: IdentityOptions): DynamicModule {
    const { database, events } = options;
    const tokens = new JwtSessionTokens(options.secret);
    const readSession = new ReadSession(tokens);
    const ids = new RandomIds();
    const players = database ? new PgPlayerRegistry(database) : new UnrecordedPlayers();
    const accounts = database ? new PgAccountStore(database) : new UnavailableAccounts();
    const hasher = new Argon2PasswordHasher();
    return {
      module: IdentityModule,
      controllers: [SessionController, AccountController],
      providers: [
        { provide: START_GUEST_SESSION, useValue: new StartGuestSession(tokens, ids, players) },
        { provide: REGISTER_ACCOUNT, useValue: new RegisterAccount({ accounts, hasher, tokens, ids, events }) },
        { provide: LOG_IN, useValue: new LogIn(accounts, hasher, tokens) },
        { provide: READ_SESSION, useValue: readSession },
        { provide: SECURE_COOKIES, useValue: options.secureCookies },
        { provide: ORIGIN_POLICY, useValue: new OriginPolicy(options.allowedOrigins) },
        { provide: IDENTITY_FOR_MODULES, useValue: new GameIdentityAdapter(readSession) },
      ],
      exports: [IDENTITY_FOR_MODULES],
    };
  }
}
