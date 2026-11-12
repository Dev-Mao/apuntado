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
