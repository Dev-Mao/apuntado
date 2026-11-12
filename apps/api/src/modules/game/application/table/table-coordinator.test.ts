import { describe, expect, it } from "vitest";
import { SETTINGS, player, tableHarness } from "./table.test-support.js";

const startAgainstBot = (settings: object = SETTINGS, seed = 7) => {
  const h = tableHarness(seed);
  const created = h.lobby.create(player("ana"), settings);
  if (!created.ok) throw new Error(created.reason);
  h.lobby.addBot("ana");
  h.lobby.start("ana");
  return { ...h, code: created.code };
};

const runUntilFinished = (h: ReturnType<typeof startAgainstBot>, maxTasks = 20_000) => {
  let tasks = 0;
  while (h.queries.lobby(h.code)?.status !== "FINISHED" && tasks < maxTasks && h.scheduler.runNext()) tasks += 1;
  return tasks;
};

describe("Coordinador de la mesa", () => {
  it("programa el vencimiento del turno a la hora límite", () => {
    const h = startAgainstBot();
    const deadline = h.queries.snapshot(h.code, "ana")?.view.turnDeadline;
    expect(h.scheduler.tasks.get(`${h.code}:turn`)?.at.toISOString()).toBe(deadline);
  });

  it("cuando es el turno del bot, el bot roba y luego descarta en pasos separados", () => {
    const h = startAgainstBot();
    expect(h.queries.snapshot(h.code, "ana")?.view.currentPlayerId).toBe("bot:1");
    h.scheduler.runNext();
    expect(h.queries.snapshot(h.code, "ana")?.view.phase).toBe("DISCARD");
    h.scheduler.runNext();
    expect(h.queries.snapshot(h.code, "ana")?.view.currentPlayerId).toBe("ana");
  });

  it("si el humano no juega, su turno vence y se resuelve solo", () => {
    const h = startAgainstBot();
    h.scheduler.runNext();
    h.scheduler.runNext();
    const before = h.journal.entriesOf(h.code).length;
    h.scheduler.runNext();
    const automatic = h.journal.entriesOf(h.code).slice(before);
    expect(automatic.map((e) => [e.playerId, e.action])).toEqual([["ana", "ROBAR_MAZO"], ["ana", "DESCARTAR"]]);
  });

  it("una mesa Clásica con un humano ausente y un bot termina sola", () => {
    const h = startAgainstBot();
    runUntilFinished(h);
    expect(h.queries.lobby(h.code)?.status).toBe("FINISHED");
    expect(h.queries.snapshot(h.code, "ana")?.view.winnerId).not.toBeNull();
    expect([...h.scheduler.tasks.keys()]).toEqual([`${h.code}:cleanup`]);
  });

  it("en Apuntado, tras cada ronda pausa y reparte la siguiente hasta terminar la partida", () => {
    const h = startAgainstBot({ ...SETTINGS, mode: "APUNTADO", eliminationThreshold: 250 });
    runUntilFinished(h);
    const view = h.queries.snapshot(h.code, "ana")!.view;
    expect(view.status).toBe("FINISHED");
    expect(view.roundNumber).toBeGreaterThan(1);
  });

});

describe("Coordinador de la mesa · reintentos y ciclo de vida", () => {
  it("si el temporizador del turno se adelanta, se reprograma y la mesa no se congela", () => {
    const h = startAgainstBot();
    h.scheduler.runNext();
    h.scheduler.runNext();
    const turn = h.scheduler.tasks.get(`${h.code}:turn`)!;
    h.scheduler.tasks.delete(`${h.code}:turn`);
    h.clock.advance((turn.at.getTime() - h.clock.now().getTime()) / 1000 - 0.001);
    turn.task();
    expect(h.queries.snapshot(h.code, "ana")?.view.currentPlayerId).toBe("ana");
    expect(h.scheduler.tasks.has(`${h.code}:turn`)).toBe(true);
    h.scheduler.runNext();
    expect(h.queries.snapshot(h.code, "ana")?.view.currentPlayerId).toBe("bot:1");
  });

  it("al terminar avisa a la sala, conserva la mesa para sus jugadores y la borra después", () => {
    const h = startAgainstBot();
    runUntilFinished(h);
    expect(h.notifier.lobby.at(-1)).toBe(h.code);
    expect(h.queries.currentRoomOf("ana")).toBe(h.code);
    expect(h.queries.snapshot(h.code, "ana")?.view.status).toBe("FINISHED");
    expect([...h.scheduler.tasks.keys()]).toEqual([`${h.code}:cleanup`]);
    h.scheduler.runNext();
    expect(h.queries.lobby(h.code)).toBeNull();
    expect(h.queries.snapshot(h.code, "ana")).toBeNull();
    expect(h.queries.currentRoomOf("ana")).toBeNull();
  });

  it("si todos salen de una mesa terminada, se borra de inmediato", () => {
    const h = startAgainstBot();
    runUntilFinished(h);
    expect(h.lobby.leave("ana")).toEqual({ ok: true });
    expect(h.queries.lobby(h.code)).toBeNull();
    expect(h.scheduler.tasks.size).toBe(0);
  });

  it("mientras la ronda está terminada no hay turno ni bot programados", () => {
    const h = startAgainstBot({ ...SETTINGS, mode: "APUNTADO", eliminationThreshold: 500 });
    while (h.queries.snapshot(h.code, "ana")?.view.status === "PLAYING") h.scheduler.runNext();
    expect([...h.scheduler.tasks.keys()]).toEqual([`${h.code}:round`]);
  });
});
