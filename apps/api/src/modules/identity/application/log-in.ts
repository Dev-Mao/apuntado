import { normalizeEmail } from "../domain/credentials.js";
import { type AccountResult, failure, fieldOf, UNAVAILABLE } from "./account-result.js";
import type { AccountStore, PasswordHasher, SessionTokens } from "./ports.js";

const WRONG_CREDENTIALS = failure("UNAUTHORIZED", "Correo o contraseña incorrectos");

export class LogIn {
  private decoy: Promise<string> | null = null;

  constructor(
    private readonly accounts: AccountStore,
    private readonly hasher: PasswordHasher,
    private readonly tokens: SessionTokens,
  ) {}

  async execute(body: unknown): Promise<AccountResult> {
    if (!this.accounts.available) return UNAVAILABLE;
    const email = normalizeEmail(fieldOf(body, "email"));
    const password = fieldOf(body, "password");
    if (!email || typeof password !== "string") return WRONG_CREDENTIALS;
    const account = await this.accounts.findByEmail(email);
    const matches = await this.hasher.verify(account?.passwordHash ?? (await this.decoyHash()), password);
    if (!account || !matches) return WRONG_CREDENTIALS;
    return { ok: true, player: account.player, token: this.tokens.issue(account.player) };
  }

  private decoyHash(): Promise<string> {
    this.decoy ??= this.hasher.hash("contraseña-señuelo-para-igualar-tiempos");
    return this.decoy;
  }
}
