import { isAcceptablePassword, normalizeEmail, PASSWORD_RULE } from "../domain/credentials.js";
import { normalizeNickname } from "../domain/nickname.js";
import type { Player } from "../domain/player.js";
import { type AccountResult, failure, fieldOf, UNAVAILABLE } from "./account-result.js";
import type { AccountStore, EventPublisher, IdGenerator, PasswordHasher, SessionTokens } from "./ports.js";

const EMAIL_TAKEN = failure("CONFLICT", "Ese correo ya tiene una cuenta");
const PLAYER_TAKEN = failure("CONFLICT", "Esta sesión ya pertenece a una cuenta; inicie sesión con ella");

interface Registration {
  readonly email: string;
  readonly password: string;
  readonly nickname: string;
}

const readRegistration = (body: unknown): Registration | AccountResult => {
  const email = normalizeEmail(fieldOf(body, "email"));
  if (!email) return failure("INVALID", "Escriba un correo válido");
  const password = fieldOf(body, "password");
  if (!isAcceptablePassword(password)) return failure("INVALID", PASSWORD_RULE);
  const nickname = normalizeNickname(fieldOf(body, "nickname"));
  if (!nickname) return failure("INVALID", "El apodo debe tener entre 2 y 16 caracteres");
  return { email, password, nickname };
};

export interface RegisterDependencies {
  readonly accounts: AccountStore;
  readonly hasher: PasswordHasher;
  readonly tokens: SessionTokens;
  readonly ids: IdGenerator;
  readonly events: EventPublisher;
}

export class RegisterAccount {
  constructor(private readonly deps: RegisterDependencies) {}

  async execute(body: unknown, existing: Player | null): Promise<AccountResult> {
    const { accounts, hasher, tokens, ids, events } = this.deps;
    if (!accounts.available) return UNAVAILABLE;
    if (existing?.kind === "REGISTRADO") return failure("CONFLICT", "Ya inició sesión con una cuenta");
    const registration = readRegistration(body);
    if ("ok" in registration) return registration;
    const { email, password, nickname } = registration;
    if (await accounts.emailInUse(email)) return EMAIL_TAKEN;
    const player: Player = { id: existing?.id ?? ids.next(), nickname, kind: "REGISTRADO" };
    const created = await accounts.register(player, email, await hasher.hash(password));
    if (created !== "CREATED") return created === "EMAIL_TAKEN" ? EMAIL_TAKEN : PLAYER_TAKEN;
    events.publish("JugadorRegistrado", { playerId: player.id });
    return { ok: true, player, token: tokens.issue(player) };
  }
}
