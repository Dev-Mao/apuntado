import { describe, expect, it } from "vitest";
import { SETTINGS, player, tableHarness } from "./table.test-support.js";

const twoPlayers = () => {
  const h = tableHarness();
  const created = h.lobby.create(player("ana"), SETTINGS);
  if (!created.ok) throw new Error(created.reason);
  h.lobby.join(player("luis"), created.code);
  h.lobby.start("ana");
  const first = h.queries.snapshot(created.code, "ana")!.view.currentPlayerId!;
  return { ...h, code: created.code, first, second: first === "ana" ? "luis" : "ana" };
};

const threePlayers = () => {
  const h = tableHarness();
  const created = h.lobby.create(player("ana"), SETTINGS);
  if (!created.ok) throw new Error(created.reason);
  h.lobby.join(player("luis"), created.code);
  h.lobby.join(player("eva"), created.code);
  h.lobby.start("ana");
  return { ...h, code: created.code };
};

describe("Abandonar la partida", () => {
  it("con dos jugadores gana el rival y quien abandonó queda libre para otra mesa", () => {
    const h = twoPlayers();
    expect(h.table.abandon(h.first)).toEqual({ ok: true });
    const view = h.queries.snapshot(h.code, h.second)!.view;
    expect(view.status).toBe("FINISHED");
    expect(view.winnerId).toBe(h.second);
    expect(view.scoreboard.find((l) => l.playerId === h.first)?.abandoned).toBe(true);
    expect(h.queries.snapshot(h.code, h.first)).toBeNull();
    expect(h.queries.currentRoomOf(h.first)).toBeNull();
    expect(h.queries.playersOf(h.code)).toEqual([h.second]);
    expect(h.lobby.create(player(h.first), SETTINGS).ok).toBe(true);
  });

  it("no se puede abandonar dos veces ni sin estar en una partida", () => {
    const h = threePlayers();
    expect(h.table.abandon("ana")).toEqual({ ok: true });
    expect(h.table.abandon("ana")).toEqual({ ok: false, reason: "No está jugando en ninguna mesa" });
    expect(h.table.abandon("nadie")).toEqual({ ok: false, reason: "No está jugando en ninguna mesa" });
  });

  it("no se puede abandonar desde el vestíbulo", () => {
    const h = tableHarness();
    h.lobby.create(player("ana"), SETTINGS);
    expect(h.table.abandon("ana").ok).toBe(false);
  });

  it("con tres jugadores la partida sigue y los turnos de quien abandonó se resuelven solos", () => {
    const h = threePlayers();
    const first = h.queries.snapshot(h.code, "ana")!.view.currentPlayerId!;
    expect(h.table.abandon(first)).toEqual({ ok: true });
    const rest = ["ana", "luis", "eva"].filter((id) => id !== first);
    expect(h.queries.snapshot(h.code, rest[0]!)!.view.status).toBe("PLAYING");
    h.scheduler.runNext();
    const view = h.queries.snapshot(h.code, rest[0]!)!.view;
    expect(view.currentPlayerId).not.toBe(first);
    expect(view.scoreboard.find((l) => l.playerId === first)).toMatchObject({ abandoned: true, eliminated: true });
  });

  it("si solo quedan máquinas la partida termina y el jugador queda libre", () => {
    const h = tableHarness();
    const created = h.lobby.create(player("ana"), SETTINGS);
    if (!created.ok) throw new Error(created.reason);
    h.lobby.addBot("ana");
    h.lobby.addBot("ana");
    h.lobby.start("ana");
    h.table.abandon("ana");
    expect(h.queries.snapshot(created.code, "ana")).toBeNull();
    expect(h.queries.lobby(created.code)?.status).toBe("FINISHED");
    expect(h.lobby.create(player("ana"), SETTINGS).ok).toBe(true);
  });

  it("entre humanos y máquinas, la partida sigue mientras quede un humano", () => {
    const h = tableHarness();
    const created = h.lobby.create(player("ana"), SETTINGS);
    if (!created.ok) throw new Error(created.reason);
    h.lobby.join(player("luis"), created.code);
    h.lobby.addBot("ana");
    h.lobby.start("ana");
    h.table.abandon("ana");
    expect(h.queries.snapshot(created.code, "luis")!.view.status).toBe("PLAYING");
  });
});
