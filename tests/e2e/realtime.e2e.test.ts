import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { ClientToServerEvents, LobbyView, ServerToClientEvents, TableSnapshot } from "@apuntado/contracts";
import { type Socket, io } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../../apps/api/src/app.module.js";
import { configureApp } from "../../apps/api/src/bootstrap.js";
import type { AppConfig } from "../../apps/api/src/config.js";

type Client = Socket<ServerToClientEvents, ClientToServerEvents>;

const SETTINGS = { mode: "CLASICA", eliminationThreshold: 101, turnSeconds: 60, stake: 0 } as const;
const WAIT_MS = 5000;
const DEV_ORIGIN = "http://localhost:3001";

let app: INestApplication;
let baseUrl: string;
const clients: Client[] = [];

beforeAll(async () => {
  const config: AppConfig = {
    port: 0,
    sessionSecret: "e2e-secret",
    secureCookies: false,
    webDir: null,
    timing: { botDelayMs: 20, roundPauseMs: 50, cleanupMs: 60_000 },
    allowedOrigins: [DEV_ORIGIN],
  };
  app = await NestFactory.create(AppModule.register(config), { logger: false });
  configureApp(app, config);
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

  it("con una sesión activa devuelve la misma en lugar de crear otra", async () => {
    const cookie = await guestCookie("Ana");
    const first = await (await fetch(`${baseUrl}/api/session`, { headers: { cookie } })).json();
    const again = await fetch(`${baseUrl}/api/session/guest`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ nickname: "Otra" }),
    });
    expect(again.headers.getSetCookie()).toEqual([]);
    expect(await again.json()).toEqual(first);
  });

  it("rechaza crear una sesión desde otro sitio web", async () => {
    const response = await fetch(`${baseUrl}/api/session/guest`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", origin: "https://evil.example" },
      body: "nickname=Pwned",
    });
    expect(response.status).toBe(403);
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it("la interfaz en modo desarrollo puede pedir la sesión con cookies desde su propio puerto", async () => {
    const preflight = await fetch(`${baseUrl}/api/session/guest`, {
      method: "OPTIONS",
      headers: { origin: DEV_ORIGIN, "access-control-request-method": "POST", "access-control-request-headers": "content-type" },
    });
    expect(preflight.headers.get("access-control-allow-origin")).toBe(DEV_ORIGIN);
    expect(preflight.headers.get("access-control-allow-credentials")).toBe("true");
    const response = await fetch(`${baseUrl}/api/session/guest`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: DEV_ORIGIN },
      body: JSON.stringify({ nickname: "Dev" }),
    });
    expect(response.status).toBe(200);
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

  it("rechaza un socket que llega desde otro sitio web aunque traiga la cookie", async () => {
    const cookie = await guestCookie("Dora");
    const foreign: Client = io(baseUrl, {
      transports: ["websocket"],
      extraHeaders: { cookie, origin: "https://evil.example" },
      forceNew: true,
    });
    clients.push(foreign);
    const error = await new Promise<Error>((resolve) => foreign.once("connect_error", resolve));
    expect(error.message).toBe("Origen no permitido");
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

});

describe("Mesa en tiempo real · partidas", () => {
  it("contra la máquina, el bot juega su turno solo y devuelve el turno al humano", async () => {
    const carla = await connect(await guestCookie("Carla"));
    const created = await carla.emitWithAck("room:create", SETTINGS);
    expect(created.ok).toBe(true);
    expect(await carla.emitWithAck("room:addBot")).toEqual({ ok: true });
    const botTurn = next(carla, "table:snapshot", (s: TableSnapshot) => s.view.currentPlayerId !== s.view.playerId);
    const humanTurn = next(carla, "table:snapshot", (s: TableSnapshot) => s.view.currentPlayerId === s.view.playerId);
    expect(await carla.emitWithAck("room:start")).toEqual({ ok: true });
    const before = (await botTurn).view;
    const after = await humanTurn;
    const botMoved = after.view.stockSize < before.stockSize || JSON.stringify(after.view.discardTop) !== JSON.stringify(before.discardTop);
    expect(botMoved).toBe(true);
    expect(after.view.opponents).toEqual([{ playerId: before.currentPlayerId, cardCount: 10 }]);
    expect(after.seats.find((s) => s.isBot)?.nickname).toBe("Máquina 1");
    expect(after.view.allowedActions).toEqual(["DRAW_STOCK", "DRAW_DISCARD"]);
  });

  it("cuatro jugadores juegan por socket y uno se desconecta, vuelve y recupera su vista", async () => {
    const names = ["Eva", "Fede", "Gabi", "Hugo"];
    const cookies = await Promise.all(names.map(guestCookie));
    const players = await Promise.all(cookies.map(connect));
    const created = await players[0]!.emitWithAck("room:create", { ...SETTINGS, mode: "AMBAS" });
    const code = created.ok ? created.code : "";
    for (const p of players.slice(1)) expect(await p.emitWithAck("room:join", code)).toEqual({ ok: true, code });
    const views = players.map((p) => next(p, "table:snapshot"));
    expect(await players[0]!.emitWithAck("room:start")).toEqual({ ok: true });
    const snapshots = await Promise.all(views);
    expect(snapshots.map((s) => s.view.hand.length)).toEqual([10, 10, 10, 10]);
    expect(snapshots.every((s) => s.view.opponents.length === 3)).toBe(true);
    expect(snapshots[0]!.view.stockSize).toBe(11);

    const gabiHand = snapshots[2]!.view.hand;
    const seen = next(players[0]!, "table:snapshot", (s: TableSnapshot) => s.seats.some((x) => x.nickname === "Gabi" && !x.connected));
    players[2]!.disconnect();
    await seen;
    const back = io(baseUrl, { transports: ["websocket"], extraHeaders: { cookie: cookies[2]! }, forceNew: true }) as Client;
    clients.push(back);
    const restored = await next(back, "table:snapshot");
    expect(restored.view.hand).toEqual(gabiHand);
    expect(restored.seats.find((x) => x.nickname === "Gabi")?.connected).toBe(true);
  });
});
