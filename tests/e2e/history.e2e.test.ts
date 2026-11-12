import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { ClientToServerEvents, ProfileView, ServerToClientEvents, TableSnapshot } from "@apuntado/contracts";
import { type Socket, io } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../../apps/api/src/app.module.js";
import { configureApp } from "../../apps/api/src/bootstrap.js";
import type { AppConfig } from "../../apps/api/src/config.js";
import { createDatabase, type Database } from "../../apps/api/src/shared/database/database.js";
import { runMigrations } from "../../apps/api/src/shared/database/migrations.js";
import { PgliteSqlClient } from "../support/pglite-sql-client.js";

type Client = Socket<ServerToClientEvents, ClientToServerEvents>;

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

const guestCookie = async (nickname: string): Promise<string> => {
  const response = await fetch(`${baseUrl}/api/session/guest`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nickname }),
  });
  return response.headers.getSetCookie()[0]!.split(";")[0]!;
};

const connect = async (cookie: string): Promise<Client> => {
  const client: Client = io(baseUrl, { transports: ["websocket"], extraHeaders: { cookie }, forceNew: true });
  clients.push(client);
  await new Promise<void>((resolve, reject) => {
    client.once("connect", () => resolve());
    client.once("connect_error", reject);
  });
  return client;
};

const playOwnTurn = (client: Client, { view }: TableSnapshot): void => {
  if (view.allowedActions.includes("DRAW_STOCK")) void client.emitWithAck("game:draw", "STOCK");
  else if (view.allowedActions.includes("DISCARD")) void client.emitWithAck("game:discard", view.hand.at(-1)!);
};

const playUntilFinished = (client: Client): Promise<TableSnapshot> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("the match did not finish")), GAME_TIMEOUT_MS);
    client.on("table:snapshot", (snapshot) => {
      if (snapshot.view.status === "FINISHED") {
        clearTimeout(timer);
        resolve(snapshot);
      } else if (snapshot.view.currentPlayerId === snapshot.view.playerId) playOwnTurn(client, snapshot);
    });
  });

const profileOf = async (cookie: string): Promise<Response> => fetch(`${baseUrl}/api/profile`, { headers: { cookie } });

describe("Historial · al terminar una partida aparece en el perfil", () => {
  it("una partida Clásica contra la máquina queda archivada con su bitácora y se ve en el perfil", async () => {
    const cookie = await guestCookie("Carla");
    const before = (await (await profileOf(cookie)).json()) as ProfileView;
    expect(before).toMatchObject({ nickname: "Carla", guest: true, played: 0, recent: [] });

    const carla = await connect(cookie);
    await carla.emitWithAck("room:create", { mode: "CLASICA", eliminationThreshold: 101, turnSeconds: 60, stake: 0 });
    await carla.emitWithAck("room:addBot");
    const finished = playUntilFinished(carla);
    expect(await carla.emitWithAck("room:start")).toEqual({ ok: true });
    const final = await finished;
    await database.queue.idle();
    expect(writeErrors).toEqual([]);

    const profile = (await (await profileOf(cookie)).json()) as ProfileView;
    const carlaWon = final.view.winnerId === final.view.playerId;
    expect(profile).toMatchObject({ played: 1, won: carlaWon ? 1 : 0 });
    expect(profile.recent).toMatchObject([{ mode: "CLASICA", won: carlaWon, rounds: 1, rivals: ["Máquina 1"] }]);

    const [counts] = await sql.query<{ plays: number; cards: number }>(
      "SELECT (SELECT COUNT(*) FROM turno_jugada)::int AS plays, (SELECT COUNT(*) FROM mano_carta)::int AS cards",
    );
    expect(counts?.plays).toBeGreaterThan(0);
    expect(counts?.cards).toBe(20);
  }, 60_000);

  it("sin sesión el perfil responde 401", async () => {
    expect((await fetch(`${baseUrl}/api/profile`)).status).toBe(401);
  });
});
