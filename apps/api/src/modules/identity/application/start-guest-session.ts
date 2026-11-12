import { normalizeNickname } from "../domain/nickname.js";
import type { Player } from "../domain/player.js";
import type { IdGenerator, PlayerRegistry, SessionTokens } from "./ports.js";

export type GuestSessionResult =
  | { readonly ok: true; readonly player: Player; readonly token: string | null }
  | { readonly ok: false; readonly reason: string };

export class StartGuestSession {
  constructor(
    private readonly tokens: SessionTokens,
    private readonly ids: IdGenerator,
    private readonly players: PlayerRegistry,
  ) {}

  execute(rawNickname: unknown, existing: Player | null = null): GuestSessionResult {
    if (existing && (rawNickname === undefined || existing.kind === "REGISTRADO")) return { ok: true, player: existing, token: null };
    const nickname = normalizeNickname(rawNickname);
    if (!nickname) return { ok: false, reason: "El apodo debe tener entre 2 y 16 caracteres" };
    if (existing?.nickname === nickname) return { ok: true, player: existing, token: null };
    const player: Player = existing ? { ...existing, nickname } : { id: this.ids.next(), nickname, kind: "INVITADO" };
    this.players.remember(player);
    return { ok: true, player, token: this.tokens.issue(player) };
  }
}
