import type { Player } from "../domain/player.js";

export interface SessionTokens {
  issue(player: Player): string;
  read(token: string): Player | null;
}

export interface IdGenerator {
  next(): string;
}

export interface PlayerRegistry {
  remember(player: Player): void;
}

export interface StoredAccount {
  readonly player: Player;
  readonly passwordHash: string;
}

export type AccountCreation = "CREATED" | "EMAIL_TAKEN";

export interface AccountStore {
  readonly available: boolean;
  register(player: Player, email: string, passwordHash: string): Promise<AccountCreation>;
  findByEmail(email: string): Promise<StoredAccount | null>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(passwordHash: string, password: string): Promise<boolean>;
}

export interface EventPublisher {
  publish(eventName: string, payload: Record<string, unknown>): void;
}
