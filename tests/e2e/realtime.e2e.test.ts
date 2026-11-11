import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { ClientToServerEvents, LobbyView, ServerToClientEvents, TableSnapshot } from "@apuntado/contracts";
import { type Socket, io } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../../apps/api/src/app.module.js";

type Client = Socket<ServerToClientEvents, ClientToServerEvents>;

const SETTINGS = { mode: "CLASICA", eliminationThreshold: 101, turnSeconds: 60, stake: 0 } as const;
const WAIT_MS = 5000;

let app: INestApplication;
let baseUrl: string;
const clients: Client[] = [];

beforeAll(async () => {
  app = await NestFactory.create(
    AppModule.register({
      port: 0,
      sessionSecret: "e2e-secret",
      secureCookies: false,
      webDir: null,
      timing: { botDelayMs: 20, roundPauseMs: 50 },
    }),
    { logger: false },
  );
  await app.listen(0);
  baseUrl = await app.getUrl();
});

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

const next = <E extends "lobby:update" | "table:snapshot">(
  client: Client,
  event: E,
  accept: (payload: Parameters<ServerToClientEvents[E]>[0]) => boolean = () => true,
): Promise<Parameters<ServerToClientEvents[E]>[0]> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout waiting for ${event}`)), WAIT_MS);
    const listener = (payload: Parameters<ServerToClientEvents[E]>[0]) => {
      if (!accept(payload)) return;
      clearTimeout(timer);
      client.off(event, listener as never);
      resolve(payload);
    };
    client.on(event, listener as never);
  });

describe("Sesión de invitado por HTTP", () => {
  it("emite una cookie httpOnly y la sesión se puede consultar", async () => {
    const response = await fetch(`${baseUrl}/api/session/guest`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nickname: "  Ana  " }),
    });
    expect(response.status).toBe(200);
    const setCookie = response.headers.getSetCookie()[0]!;
    expect(setCookie).toMatch(/HttpOnly/i);
    const session = await fetch(`${baseUrl}/api/session`, { headers: { cookie: setCookie.split(";")[0]! } });
    expect(await session.json()).toMatchObject({ nickname: "Ana", guest: true });
  });

  it("rechaza un apodo demasiado corto y una consulta sin sesión", async () => {
    const short = await fetch(`${baseUrl}/api/session/guest`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nickname: "A" }),
    });
    expect(short.status).toBe(400);
    expect((await fetch(`${baseUrl}/api/session`)).status).toBe(401);
  });
});

describe("Mesa en tiempo real", () => {
  it("rechaza un socket sin sesión", async () => {
    const anonymous: Client = io(baseUrl, { transports: ["websocket"], forceNew: true });
    clients.push(anonymous);
    const error = await new Promise<Error>((resolve) => anonymous.once("connect_error", resolve));
    expect(error.message).toBe("No hay una sesión activa");
  });

  it("dos jugadores crean, se unen, juegan y uno se reconecta sin perder su mano", async () => {
    const anaCookie = await guestCookie("Ana");
    const luisCookie = await guestCookie("Luis");
    const ana = await connect(anaCookie);
    let luis = await connect(luisCookie);

    const created = await ana.emitWithAck("room:create", SETTINGS);
    expect(created.ok).toBe(true);
    const code = created.ok ? created.code : "";

    const lobbySeen = next(ana, "lobby:update", (l: LobbyView) => l.seats.length === 2);
    expect(await luis.emitWithAck("room:join", code)).toEqual({ ok: true, code });
    expect((await lobbySeen).seats.map((s) => s.nickname)).toEqual(["Ana", "Luis"]);

    const anaTable = next(ana, "table:snapshot");
    const luisTable = next(luis, "table:snapshot");
    expect(await ana.emitWithAck("room:start")).toEqual({ ok: true });
    const [anaView, luisView] = [(await anaTable).view, (await luisTable).view];
    expect(anaView.hand).toHaveLength(10);
    expect(anaView.opponents).toEqual([{ playerId: luisView.playerId, cardCount: 10 }]);
    expect(JSON.stringify(anaView)).not.toContain(JSON.stringify(luisView.hand[0]));

    const [mover, watcher] = anaView.currentPlayerId === anaView.playerId ? [ana, luis] : [luis, ana];
    const watcherUpdate = next(watcher, "table:snapshot", (s: TableSnapshot) => s.view.opponents[0]?.cardCount === 11);
    expect(await mover.emitWithAck("game:draw", "STOCK")).toEqual({ ok: true });
    await watcherUpdate;
    expect(await watcher.emitWithAck("game:draw", "STOCK")).toEqual({ ok: false, reason: "No es su turno" });

    const presence = next(ana, "table:snapshot", (s: TableSnapshot) => s.seats.some((seat) => seat.nickname === "Luis" && !seat.connected));
    luis.disconnect();
    await presence;

    const luisHand = luisView.hand;
    const reconnected = io(baseUrl, { transports: ["websocket"], extraHeaders: { cookie: luisCookie }, forceNew: true }) as Client;
    clients.push(reconnected);
    const restored = await next(reconnected, "table:snapshot");
    luis = reconnected;
    expect(restored.code).toBe(code);
    expect(restored.view.hand.slice(0, 10)).toEqual(luisHand.slice(0, 10));
  });

  it("contra la máquina, el bot juega su turno solo y devuelve el turno al humano", async () => {
    const carla = await connect(await guestCookie("Carla"));
    const created = await carla.emitWithAck("room:create", SETTINGS);
    expect(created.ok).toBe(true);
    expect(await carla.emitWithAck("room:addBot")).toEqual({ ok: true });
    const humanTurn = next(carla, "table:snapshot", (s: TableSnapshot) => s.view.currentPlayerId === s.view.playerId);
    await carla.emitWithAck("room:start");
    const snapshot = await humanTurn;
    expect(snapshot.seats.find((s) => s.isBot)?.nickname).toBe("Máquina 1");
    expect(snapshot.view.allowedActions).toEqual(["DRAW_STOCK", "DRAW_DISCARD"]);
  });
});
