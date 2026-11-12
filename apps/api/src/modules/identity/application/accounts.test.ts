import { describe, expect, it } from "vitest";
import type { Player } from "../domain/player.js";
import { JwtSessionTokens } from "../infrastructure/jwt-session-tokens.js";
import { LogIn } from "./log-in.js";
import type { AccountCreation, AccountStore, PasswordHasher, StoredAccount } from "./ports.js";
import { RegisterAccount } from "./register-account.js";

class MemoryAccounts implements AccountStore {
  readonly available = true;
  readonly byEmail = new Map<string, StoredAccount>();

  async emailInUse(email: string): Promise<boolean> {
    return this.byEmail.has(email);
  }

  async register(player: Player, email: string, passwordHash: string): Promise<AccountCreation> {
    if (this.byEmail.has(email)) return "EMAIL_TAKEN";
    this.byEmail.set(email, { player, passwordHash });
    return "CREATED";
  }

  async findByEmail(email: string): Promise<StoredAccount | null> {
    return this.byEmail.get(email) ?? null;
  }
}

const calls = { hash: 0, verify: 0 };
const hasher: PasswordHasher = {
  hash: async (password) => {
    calls.hash += 1;
    return `hashed:${password}`;
  },
  verify: async (passwordHash, password) => {
    calls.verify += 1;
    return passwordHash === `hashed:${password}`;
  },
};

const setup = (accounts: AccountStore = new MemoryAccounts()) => {
  const tokens = new JwtSessionTokens("test-secret");
  const published: { name: string; payload: Record<string, unknown> }[] = [];
  const events = { publish: (name: string, payload: Record<string, unknown>) => void published.push({ name, payload }) };
  const register = new RegisterAccount({ accounts, hasher, tokens, ids: { next: () => "new-id" }, events });
  return { register, logIn: new LogIn(accounts, hasher, tokens), tokens, published, accounts };
};

const EVA = { email: "  Eva@Example.COM ", password: "secreto123", nickname: "Eva" };
const GUEST: Player = { id: "guest-id", nickname: "Evita", kind: "INVITADO" };

describe("Cuentas · registro", () => {
  it("crea una cuenta registrada, guarda la contraseña cifrada y avisa del registro", async () => {
    const { register, published, accounts, tokens } = setup();
    const result = await register.execute(EVA, null);
    expect(result).toMatchObject({ ok: true, player: { id: "new-id", nickname: "Eva", kind: "REGISTRADO" } });
    if (result.ok) expect(tokens.read(result.token)?.kind).toBe("REGISTRADO");
    expect((accounts as unknown as MemoryAccounts).byEmail.get("eva@example.com")?.passwordHash).toBe("hashed:secreto123");
    expect(published).toEqual([{ name: "JugadorRegistrado", payload: { playerId: "new-id" } }]);
  });

  it("un invitado que se registra conserva su identidad", async () => {
    const { register } = setup();
    expect(await register.execute(EVA, GUEST)).toMatchObject({ ok: true, player: { id: "guest-id", kind: "REGISTRADO" } });
  });

  it.each([
    ["un correo inválido", { ...EVA, email: "eva" }, "Escriba un correo válido"],
    ["una contraseña corta", { ...EVA, password: "corta" }, "La contraseña debe tener entre 8 y 128 caracteres"],
    ["un apodo vacío", { ...EVA, nickname: " " }, "El apodo debe tener entre 2 y 16 caracteres"],
  ])("rechaza %s sin crear nada", async (_caso, body, reason) => {
    const { register, published } = setup();
    expect(await register.execute(body, null)).toEqual({ ok: false, problem: "INVALID", reason });
    expect(published).toEqual([]);
  });

  it("no repite un correo ni registra a quien ya tiene cuenta", async () => {
    const { register } = setup();
    await register.execute(EVA, null);
    expect(await register.execute({ ...EVA, nickname: "Otra" }, null)).toMatchObject({ ok: false, problem: "CONFLICT" });
    const registered: Player = { id: "x", nickname: "Eva", kind: "REGISTRADO" };
    expect(await register.execute(EVA, registered)).toMatchObject({ ok: false, problem: "CONFLICT" });
  });

  it("un correo ya usado se rechaza antes de gastar tiempo cifrando la contraseña", async () => {
    const { register } = setup();
    await register.execute(EVA, null);
    const before = calls.hash;
    await register.execute({ ...EVA, nickname: "Otra" }, null);
    expect(calls.hash).toBe(before);
  });

  it("si la sesión ya pertenece a una cuenta, pide iniciar sesión con ella", async () => {
    const taken: AccountStore = { available: true, emailInUse: async () => false, register: async () => "PLAYER_TAKEN", findByEmail: async () => null };
    expect(await setup(taken).register.execute(EVA, GUEST)).toEqual({
      ok: false,
      problem: "CONFLICT",
      reason: "Esta sesión ya pertenece a una cuenta; inicie sesión con ella",
    });
  });

  it("sin base de datos las cuentas no están disponibles", async () => {
    const unavailable: AccountStore = { available: false, emailInUse: async () => false, register: async () => "CREATED", findByEmail: async () => null };
    const { register, logIn } = setup(unavailable);
    expect(await register.execute(EVA, null)).toMatchObject({ ok: false, problem: "UNAVAILABLE" });
    expect(await logIn.execute(EVA)).toMatchObject({ ok: false, problem: "UNAVAILABLE" });
  });
});

describe("Cuentas · inicio de sesión", () => {
  it("con el correo y la contraseña correctos devuelve al jugador registrado", async () => {
    const { register, logIn } = setup();
    await register.execute(EVA, null);
    expect(await logIn.execute({ email: "eva@example.com", password: "secreto123" })).toMatchObject({
      ok: true,
      player: { id: "new-id", nickname: "Eva", kind: "REGISTRADO" },
    });
  });

  it("una contraseña equivocada y un correo desconocido responden lo mismo", async () => {
    const { register, logIn } = setup();
    await register.execute(EVA, null);
    const wrong = { ok: false, problem: "UNAUTHORIZED", reason: "Correo o contraseña incorrectos" };
    expect(await logIn.execute({ email: "eva@example.com", password: "otra-clave" })).toEqual(wrong);
    expect(await logIn.execute({ email: "nadie@example.com", password: "secreto123" })).toEqual(wrong);
    expect(await logIn.execute({})).toEqual(wrong);
  });

  it("con un correo desconocido también verifica una contraseña, para no delatar qué correos existen", async () => {
    const { logIn } = setup();
    const before = calls.verify;
    await logIn.execute({ email: "nadie@example.com", password: "secreto123" });
    expect(calls.verify).toBe(before + 1);
  });
});
