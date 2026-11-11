import type { Player } from "../domain/player.js";
import type { SessionTokens } from "./ports.js";

export const SESSION_COOKIE = "apuntado_session";

export class ReadSession {
  constructor(private readonly tokens: SessionTokens) {}

  fromToken(token: string | undefined): Player | null {
    return token ? this.tokens.read(token) : null;
  }
}
