import { parseCookie } from "cookie";
import type { AuthenticatedPlayer, PlayerIdentity } from "../../game/index.js";
import { type ReadSession, SESSION_COOKIE } from "../application/read-session.js";

export class GameIdentityAdapter implements PlayerIdentity {
  constructor(private readonly sessions: ReadSession) {}

  resolve(cookieHeader: string | undefined): AuthenticatedPlayer | null {
    const token = cookieHeader ? parseCookie(cookieHeader)[SESSION_COOKIE] : undefined;
    const player = this.sessions.fromToken(token);
    return player ? { id: player.id, nickname: player.nickname, guest: player.kind === "INVITADO" } : null;
  }
}
