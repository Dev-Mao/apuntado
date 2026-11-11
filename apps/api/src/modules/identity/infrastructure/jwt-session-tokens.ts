import jwt from "jsonwebtoken";
import type { SessionTokens } from "../application/ports.js";
import type { Player, PlayerKind } from "../domain/player.js";

export const SESSION_DAYS = 7;

const KINDS: readonly string[] = ["REGISTRADO", "INVITADO"];

interface SessionClaims {
  readonly sub: string;
  readonly nickname: string;
  readonly kind: PlayerKind;
}

const isClaims = (value: unknown): value is SessionClaims => {
  if (typeof value !== "object" || value === null) return false;
  const claims = value as Record<string, unknown>;
  return typeof claims["sub"] === "string" && typeof claims["nickname"] === "string" && KINDS.includes(String(claims["kind"]));
};

export class JwtSessionTokens implements SessionTokens {
  constructor(private readonly secret: string) {}

  issue(player: Player): string {
    const claims = { nickname: player.nickname, kind: player.kind };
    return jwt.sign(claims, this.secret, { subject: player.id, expiresIn: `${SESSION_DAYS}d`, algorithm: "HS256" });
  }

  read(token: string): Player | null {
    try {
      const claims = jwt.verify(token, this.secret, { algorithms: ["HS256"] });
      return isClaims(claims) ? { id: claims.sub, nickname: claims.nickname, kind: claims.kind } : null;
    } catch {
      return null;
    }
  }
}
