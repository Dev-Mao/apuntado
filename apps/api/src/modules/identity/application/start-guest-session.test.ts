import { describe, expect, it } from "vitest";
import { JwtSessionTokens } from "../infrastructure/jwt-session-tokens.js";
import { ReadSession } from "./read-session.js";
import { StartGuestSession } from "./start-guest-session.js";

const tokens = new JwtSessionTokens("test-secret");
const ids = { next: () => "id-1" };
const remembered: string[] = [];
const start = new StartGuestSession(tokens, ids, { remember: (player) => remembered.push(player.nickname) });
const read = new ReadSession(tokens);

describe("Sesión de invitado", () => {
  it("normaliza el apodo y emite un token legible por el servidor", () => {
    const result = start.execute("  Ana   María ");
    expect(result).toMatchObject({ ok: true, player: { id: "id-1", nickname: "Ana María", kind: "INVITADO" } });
    if (result.ok) expect(read.fromToken(result.token ?? undefined)).toEqual(result.player);
  });

  it.each([["una letra", "A"], ["17 caracteres", "abcdefghijklmnopq"], ["un valor que no es texto", 42], ["nada", undefined]])(
    "rechaza un apodo con %s",
    (_caso, nickname) => {
      expect(start.execute(nickname)).toEqual({ ok: false, reason: "El apodo debe tener entre 2 y 16 caracteres" });
    },
  );

  it("no acepta un token alterado ni uno firmado con otra clave", () => {
    const result = start.execute("Ana");
    if (!result.ok) throw new Error(result.reason);
    const [header, payload, signature] = (result.token ?? "").split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "otro", nickname: "Ana", kind: "REGISTRADO" })).toString("base64url");
    expect(read.fromToken(`${header}.${forged}.${signature}`)).toBeNull();
    expect(new ReadSession(new JwtSessionTokens("otra-clave")).fromToken(result.token ?? undefined)).toBeNull();
    expect(read.fromToken(`${header}.${payload}`)).toBeNull();
  });

  it("con una sesión activa conserva al jugador y solo emite un token nuevo si cambia el apodo", () => {
    remembered.length = 0;
    const first = start.execute("Ana");
    if (!first.ok) throw new Error(first.reason);
    expect(remembered).toEqual(["Ana"]);
    expect(start.execute("Ana", first.player)).toEqual({ ok: true, player: first.player, token: null });
    expect(start.execute(undefined, first.player)).toEqual({ ok: true, player: first.player, token: null });
    const renamed = start.execute("Anita", first.player);
    expect(remembered).toEqual(["Ana", "Anita"]);
    expect(renamed).toMatchObject({ ok: true, player: { id: "id-1", nickname: "Anita", kind: "INVITADO" } });
    if (renamed.ok) expect(read.fromToken(renamed.token ?? "")?.nickname).toBe("Anita");
  });

  it("una cuenta registrada no se convierte en invitado ni cambia de apodo por esta vía", () => {
    const registered = { id: "reg-1", nickname: "Eva", kind: "REGISTRADO" as const };
    expect(start.execute("Otro", registered)).toEqual({ ok: true, player: registered, token: null });
  });

  it("sin token no hay sesión", () => {
    expect(read.fromToken(undefined)).toBeNull();
  });
});
