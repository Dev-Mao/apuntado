import { describe, expect, it } from "vitest";
import { Room } from "./room.js";
import type { RoomMember, RoomSettings } from "./room.types.js";

const SETTINGS: RoomSettings = { mode: "APUNTADO", eliminationThreshold: 101, turnSeconds: 60, stake: 0 };
const ANA: RoomMember = { id: "ana", nickname: "Ana", guest: true };
const LUIS: RoomMember = { id: "luis", nickname: "Luis", guest: true };
const EVA: RoomMember = { id: "eva", nickname: "Eva", guest: false };

const openRoom = (settings = SETTINGS, host = ANA): Room => {
  const room = Room.open("K7Q2", host, settings);
  if (typeof room === "string") throw new Error(room);
  return room;
};

describe("Sala · apertura", () => {
  it("el anfitrión queda sentado y la sala en espera", () => {
    const room = openRoom();
    expect(room.hostId).toBe("ana");
    expect(room.status).toBe("LOBBY");
    expect(room.seats).toEqual([{ playerId: "ana", nickname: "Ana", isBot: false }]);
  });

  it.each([
    ["una modalidad inexistente", { ...SETTINGS, mode: "POKER" as never }, "La modalidad no existe"],
    ["un umbral en cero", { ...SETTINGS, eliminationThreshold: 0 }, "El umbral debe estar entre 1 y 500 puntos"],
    ["un umbral desmedido", { ...SETTINGS, eliminationThreshold: 1e15 }, "El umbral debe estar entre 1 y 500 puntos"],
    ["un turno de 5 segundos", { ...SETTINGS, turnSeconds: 5 }, "La duración del turno debe estar entre 10 y 600 segundos"],
    ["una apuesta negativa", { ...SETTINGS, stake: -1 }, "La apuesta debe estar entre 0 y 100000 fichas"],
    ["una apuesta desmedida", { ...SETTINGS, stake: 100_001 }, "La apuesta debe estar entre 0 y 100000 fichas"],
  ])("rechaza %s", (_caso, settings, reason) => {
    expect(Room.open("K7Q2", ANA, settings)).toBe(reason);
  });

  it("un invitado no puede abrir una mesa con apuesta, un registrado sí", () => {
    expect(Room.open("K7Q2", ANA, { ...SETTINGS, stake: 50 })).toBe("Un invitado no puede crear mesas con apuesta");
    expect(Room.open("K7Q2", EVA, { ...SETTINGS, stake: 50 })).toBeInstanceOf(Room);
  });
});

describe("Sala · asientos", () => {
  it("admite hasta 4 jugadores", () => {
    const room = openRoom();
    room.join(LUIS);
    room.join(EVA);
    room.join({ id: "leo", nickname: "Leo", guest: true });
    expect(room.join({ id: "sol", nickname: "Sol", guest: true })).toEqual({ ok: false, reason: "La mesa está llena" });
  });

  it("unirse dos veces no duplica el asiento", () => {
    const room = openRoom();
    room.join(LUIS);
    expect(room.join(LUIS)).toEqual({ ok: true });
    expect(room.playerIds).toEqual(["ana", "luis"]);
  });

  it("un invitado no se une a una mesa con apuesta", () => {
    const room = openRoom({ ...SETTINGS, stake: 50 }, EVA);
    expect(room.join(LUIS)).toEqual({ ok: false, reason: "Un invitado no puede unirse a una mesa con apuesta" });
  });

  it("la máquina no se sienta en una mesa con apuesta", () => {
    const room = openRoom({ ...SETTINGS, stake: 50 }, EVA);
    expect(room.addBot("eva")).toEqual({ ok: false, reason: "La máquina no juega en mesas con apuesta" });
    expect(room.playerIds).toEqual(["eva"]);
  });

  it("si el anfitrión sale, el anfitrión pasa al siguiente humano", () => {
    const room = openRoom();
    room.addBot("ana");
    room.join(LUIS);
    room.leave("ana");
    expect(room.hostId).toBe("luis");
  });

  it("solo el anfitrión agrega bots, que se sientan con su propio nombre", () => {
    const room = openRoom();
    room.join(LUIS);
    expect(room.addBot("luis")).toEqual({ ok: false, reason: "Solo el anfitrión puede hacerlo" });
    room.addBot("ana");
    expect(room.seats.at(-1)).toEqual({ playerId: "bot:1", nickname: "Máquina 1", isBot: true });
    expect(room.isBot("bot:1")).toBe(true);
  });
});

describe("Sala · inicio", () => {
  it("se necesitan al menos 2 jugadores y solo inicia el anfitrión", () => {
    const room = openRoom();
    expect(room.canStart("ana")).toEqual({ ok: false, reason: "Se necesitan al menos 2 jugadores para empezar" });
    room.addBot("ana");
    expect(room.canStart("bot:1")).toEqual({ ok: false, reason: "Solo el anfitrión puede hacerlo" });
    expect(room.canStart("ana")).toEqual({ ok: true });
  });

  it("terminada la partida, los jugadores pueden salir de la mesa", () => {
    const room = openRoom();
    room.join(LUIS);
    room.markStarted();
    room.markFinished();
    expect(room.leave("luis")).toEqual({ ok: true });
  });

  it("con la partida en curso nadie entra ni sale", () => {
    const room = openRoom();
    room.join(LUIS);
    room.markStarted();
    expect(room.join(EVA)).toEqual({ ok: false, reason: "La partida de esta mesa ya empezó" });
    expect(room.leave("luis")).toEqual({ ok: false, reason: "No puede salir de una partida en curso" });
    expect(room.addBot("ana")).toEqual({ ok: false, reason: "La partida de esta mesa ya empezó" });
  });
});
