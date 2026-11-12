import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { ClientToServerEvents, ServerToClientEvents, TableSnapshot, WalletView } from "@apuntado/contracts";
import { type Socket, io } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../../apps/api/src/app.module.js";
import { configureApp } from "../../apps/api/src/bootstrap.js";
import type { AppConfig } from "../../apps/api/src/config.js";
import { createDatabase, type Database } from "../../apps/api/src/shared/database/database.js";
import { runMigrations } from "../../apps/api/src/shared/database/migrations.js";
import { PgliteSqlClient } from "../support/pglite-sql-client.js";

type Client = Socket<ServerToClientEvents, ClientToServerEvents>;

const STAKED = { mode: "CLASICA", eliminationThreshold: 101, turnSeconds: 60, stake: 100 } as const;
const GAME_TIMEOUT_MS = 30_000;

let app: INestApplication;
let baseUrl: string;
let sql: PgliteSqlClient;
let database: Database;
const writeErrors: unknown[] = [];
const clients: Client[] = [];

beforeAll(async () => {
  sql = new PgliteSqlClient();
  await runMigrations(sql);
  database = createDatabase(sql, (error) => writeErrors.push(error));
  const config: AppConfig = {
    port: 0,
    sessionSecret: "e2e-secret",
    secureCookies: false,
    webDir: null,
    timing: { botDelayMs: 5, roundPauseMs: 20, cleanupMs: 60_000 },
    allowedOrigins: [],
    databaseUrl: null,
  };
  app = await NestFactory.create(AppModule.register(config, database), { logger: false });
  configureApp(app, config);
  await app.listen(0);
  baseUrl = await app.getUrl();
}, 60_000);

afterAll(async () => {
  for (const client of clients) client.disconnect();
  await app.close();
});

const post = (path: string, body: unknown, cookie = "") =>
  fetch(`${baseUrl}/api/session/${path}`, { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify(body) });

const cookieOf = (response: Response): string => response.headers.getSetCookie()[0]!.split(";")[0]!;

const register = async (nickname: string): Promise<string> => {
  const response = await post("register", { email: `${nickname.toLowerCase()}@example.com`, password: "secreto123", nickname });
  expect(response.status).toBe(200);
  return cookieOf(response);
};

const wallet = async (cookie: string): Promise<WalletView> => (await (await fetch(`${baseUrl}/api/wallet`, { headers: { cookie } })).json()) as WalletView;

const connect = async (cookie: string): Promise<Client> => {
  const client: Client = io(baseUrl, { transports: ["websocket"], extraHeaders: { cookie }, forceNew: true });
  clients.push(client);
  await new Promise<void>((resolve, reject) => {
    client.once("connect", () => resolve());
    client.once("connect_error", reject);
  });
  return client;
};

const playUntilFinished = (client: Client): Promise<TableSnapshot> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("the match did not finish")), GAME_TIMEOUT_MS);
    client.on("table:snapshot", (snapshot) => {
      const { view } = snapshot;
      if (view.status === "FINISHED") {
        clearTimeout(timer);
        resolve(snapshot);
      } else if (view.currentPlayerId === view.playerId && view.allowedActions.includes("DRAW_STOCK")) {
        void client.emitWithAck("game:draw", "STOCK");
      } else if (view.currentPlayerId === view.playerId && view.allowedActions.includes("DISCARD")) {
        void client.emitWithAck("game:discard", view.hand.at(-1)!);
      }
    });
  });

describe("Economía · el libro cuadra con el saldo", () => {
  it("dos cuentas juegan una mesa con apuesta: se retiene, el bote va al ganador y el total se conserva", async () => {
    const [eva, tom] = [await register("Eva"), await register("Tom")];
    expect((await wallet(eva)).balance).toBe(1000);

    const evaSocket = await connect(eva);
    const tomSocket = await connect(tom);
    const created = await evaSocket.emitWithAck("room:create", STAKED);
    const code = created.ok ? created.code : "";
    expect(await evaSocket.emitWithAck("room:addBot")).toEqual({ ok: false, reason: "La máquina no juega en mesas con apuesta" });
    expect(await tomSocket.emitWithAck("room:join", code)).toEqual({ ok: true, code });

    const finished = Promise.all([playUntilFinished(evaSocket), playUntilFinished(tomSocket)]);
    expect(await evaSocket.emitWithAck("room:start")).toEqual({ ok: true });
    const [final] = await finished;
    expect(final.stake).toBe(100);
    await database.queue.idle();

    const evaWon = final.view.winnerId === final.view.playerId;
    const [evaWallet, tomWallet] = [await wallet(eva), await wallet(tom)];
    expect([evaWallet.balance, tomWallet.balance]).toEqual(evaWon ? [1100, 900] : [900, 1100]);
    expect(evaWallet.movements.map((m) => m.reason)).toEqual(
      evaWon ? ["BOTE_GANADO", "APUESTA_RETENIDA", "BONO_BIENVENIDA"] : ["APUESTA_RETENIDA", "BONO_BIENVENIDA"],
    );
    const ids = [final.view.playerId, ...final.view.opponents.map((o) => o.playerId)];
    const view = await sql.query<{ jugador_id: string; saldo: number }>("SELECT jugador_id, saldo::int AS saldo FROM saldo_jugador");
    const ours = view.filter((row) => ids.includes(row.jugador_id));
    expect(ours).toHaveLength(2);
    expect(ours.reduce((total, row) => total + row.saldo, 0)).toBe(2000);
    expect(writeErrors).toEqual([]);
  }, 60_000);

  it("un invitado no puede apostar ni tiene fichas", async () => {
    const guest = cookieOf(await post("guest", { nickname: "Invi" }));
    expect((await fetch(`${baseUrl}/api/wallet`, { headers: { cookie: guest } })).status).toBe(403);
    const socket = await connect(guest);
    expect(await socket.emitWithAck("room:create", STAKED)).toEqual({ ok: false, reason: "Un invitado no puede crear mesas con apuesta" });

    const host = await connect(await register("Ana"));
    const created = await host.emitWithAck("room:create", STAKED);
    const code = created.ok ? created.code : "";
    expect(await socket.emitWithAck("room:join", code)).toEqual({ ok: false, reason: "Un invitado no puede unirse a una mesa con apuesta" });
  });
});

describe("Cuentas por HTTP", () => {
  it("inicia sesión con la cuenta creada, rechaza la clave equivocada y cierra la sesión", async () => {
    await register("Luz");
    const wrong = await post("login", { email: "luz@example.com", password: "equivocada" });
    expect(wrong.status).toBe(401);
    const login = await post("login", { email: "LUZ@example.com", password: "secreto123" });
    expect(login.status).toBe(200);
    expect(await login.json()).toMatchObject({ nickname: "Luz", guest: false });
    const logout = await post("logout", {}, cookieOf(login));
    expect(logout.status).toBe(204);
    expect(logout.headers.getSetCookie()[0]).toMatch(/apuntado_session=;/);
  });

  it("un correo repetido responde 409 y una contraseña corta 400", async () => {
    await register("Sol");
    expect((await post("register", { email: "sol@example.com", password: "secreto123", nickname: "Otro" })).status).toBe(409);
    expect((await post("register", { email: "mar@example.com", password: "corta", nickname: "Mar" })).status).toBe(400);
  });
});
