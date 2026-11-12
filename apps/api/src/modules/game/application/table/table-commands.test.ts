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

describe("Comandos de la mesa", () => {
  it("el jugador actúa sin indicar la mesa: el servidor la conoce", () => {
    const h = twoPlayers();
    expect(h.table.draw(h.first, "STOCK")).toEqual({ ok: true });
    const card = h.queries.snapshot(h.code, h.first)!.view.hand[0]!;
    expect(h.table.discard(h.first, card)).toEqual({ ok: true });
    expect(h.queries.snapshot(h.code, h.second)!.view.currentPlayerId).toBe(h.second);
  });

  it("cada jugada válida avisa a la mesa", () => {
    const h = twoPlayers();
    const before = h.notifier.table.length;
    h.table.draw(h.first, "STOCK");
    expect(h.notifier.table.length).toBe(before + 1);
  });

  it("una jugada rechazada no avisa a la mesa", () => {
    const h = twoPlayers();
    const before = h.notifier.table.length;
    expect(h.table.draw(h.second, "STOCK")).toEqual({ ok: false, reason: "No es su turno" });
    expect(h.notifier.table.length).toBe(before);
  });

  it.each([
    ["un origen de robo desconocido", (h: ReturnType<typeof twoPlayers>) => h.table.draw(h.first, "BARAJA"), "Origen de robo inválido"],
    ["una carta mal formada", (h: ReturnType<typeof twoPlayers>) => h.table.discard(h.first, { rank: "Z", suit: "H" }), "Carta inválida"],
    ["un cierre mal formado", (h: ReturnType<typeof twoPlayers>) => h.table.declare(h.first, { type: "CLASICO" }), "Declaración de cierre inválida"],
  ])("rechaza con motivo %s enviado por el cliente", (_caso, action, reason) => {
    expect(action(twoPlayers())).toEqual({ ok: false, reason });
  });

  it("ningún jugador puede saltarse la pausa entre rondas: no existe ese comando", () => {
    expect("nextRound" in twoPlayers().table).toBe(false);
  });

  it("quien no está en una mesa no puede jugar", () => {
    expect(tableHarness().table.draw("nadie", "STOCK")).toEqual({ ok: false, reason: "No está jugando en ninguna mesa" });
  });
});
