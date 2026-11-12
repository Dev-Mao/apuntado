import { describe, expect, it } from "vitest";
import { SETTINGS, player, tableHarness } from "./table.test-support.js";

const ANA = player("ana");
const LUIS = player("luis");

const created = (h: ReturnType<typeof tableHarness>) => {
  const result = h.lobby.create(ANA, SETTINGS);
  if (!result.ok) throw new Error(result.reason);
  return result.code;
};

describe("Sala de espera", () => {
  it("crear una mesa devuelve un código de 4 caracteres sin símbolos ambiguos", () => {
    const code = created(tableHarness());
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{4}$/);
  });

  it("rechaza una configuración mal formada sin lanzar errores", () => {
    expect(tableHarness().lobby.create(ANA, { mode: "CLASICA" })).toEqual({
      ok: false, reason: "La configuración de la mesa no es válida",
    });
  });

  it("un jugador no puede estar en dos mesas a la vez", () => {
    const h = tableHarness();
    created(h);
    expect(h.lobby.create(ANA, SETTINGS)).toEqual({ ok: false, reason: "Ya está sentado en otra mesa" });
  });

  it("unirse acepta el código en minúsculas y anuncia el cambio a la sala", () => {
    const h = tableHarness();
    const code = created(h);
    expect(h.lobby.join(LUIS, code.toLowerCase())).toEqual({ ok: true, code });
    expect(h.queries.lobby(code)?.seats.map((s) => s.playerId)).toEqual(["ana", "luis"]);
    expect(h.notifier.lobby).toContain(code);
  });

  it("volver a unirse estando sentado no anuncia nada a la sala", () => {
    const h = tableHarness();
    const code = created(h);
    h.lobby.join(LUIS, code);
    const announced = h.notifier.lobby.length;
    expect(h.lobby.join(LUIS, code)).toEqual({ ok: true, code });
    expect(h.notifier.lobby.length).toBe(announced);
  });

  it("la vista de la sala informa la capacidad de la mesa", () => {
    const h = tableHarness();
    expect(h.queries.lobby(created(h))?.maxSeats).toBe(4);
  });

  it("un código inexistente se rechaza", () => {
    expect(tableHarness().lobby.join(LUIS, "ZZZZ")).toEqual({ ok: false, reason: "No existe una mesa con ese código" });
  });

});

describe("Sala de espera · apuestas", () => {
  const STAKED = { ...SETTINGS, stake: 100 };
  const EVA = player("eva", false);
  const TOM = player("tom", false);
  const NO_FUNDS = "No tiene fichas suficientes para la apuesta de esta mesa";

  it("sin fichas suficientes no se crea una mesa con apuesta", () => {
    const h = tableHarness(7, { eva: 99 });
    expect(h.lobby.create(EVA, STAKED)).toEqual({ ok: false, reason: NO_FUNDS });
    expect(h.lobby.create(EVA, SETTINGS).ok).toBe(true);
  });

  it("sin fichas suficientes no se une a una mesa con apuesta, con fichas sí", () => {
    const h = tableHarness(7, { eva: 500, tom: 100, ian: 99 });
    const created = h.lobby.create(EVA, STAKED);
    const code = created.ok ? created.code : "";
    expect(h.lobby.join(player("ian", false), code)).toEqual({ ok: false, reason: NO_FUNDS });
    expect(h.lobby.join(TOM, code)).toEqual({ ok: true, code });
  });

  it("al iniciar retiene la apuesta de cada jugador para esa partida", () => {
    const h = tableHarness(7, { eva: 500, tom: 300 });
    const created = h.lobby.create(EVA, STAKED);
    const code = created.ok ? created.code : "";
    h.lobby.join(TOM, code);
    expect(h.lobby.start("eva")).toEqual({ ok: true });
    expect(h.stakes.holds).toEqual([{ matchId: "match-1", playerIds: ["eva", "tom"], stake: 100 }]);
  });

  it("una mesa sin apuesta no consulta saldos ni retiene nada", () => {
    const h = tableHarness();
    const code = created(h);
    h.lobby.join(LUIS, code);
    expect(h.lobby.start("ana")).toEqual({ ok: true });
    expect(h.stakes.holds).toEqual([]);
  });
});

describe("Sala de espera · inicio y ciclo de vida", () => {
  it("si el último humano sale, la mesa desaparece", () => {
    const h = tableHarness();
    const code = created(h);
    h.lobby.addBot("ana");
    h.lobby.leave("ana");
    expect(h.queries.lobby(code)).toBeNull();
  });

  it("iniciar crea la partida y cada jugador recibe su vista", () => {
    const h = tableHarness();
    const code = created(h);
    h.lobby.join(LUIS, code);
    expect(h.lobby.start("ana")).toEqual({ ok: true });
    expect(h.queries.lobby(code)?.status).toBe("PLAYING");
    expect(h.queries.snapshot(code, "luis")?.view.hand).toHaveLength(10);
    expect(h.notifier.table).toContain(code);
  });

  it("solo el anfitrión inicia y con al menos dos jugadores", () => {
    const h = tableHarness();
    const code = created(h);
    expect(h.lobby.start("ana").ok).toBe(false);
    h.lobby.join(LUIS, code);
    expect(h.lobby.start("luis")).toEqual({ ok: false, reason: "Solo el anfitrión puede hacerlo" });
  });

  it("una sala de espera sin nadie conectado se borra tras la espera, y se salva si alguien vuelve", () => {
    const h = tableHarness();
    const code = created(h);
    h.lobby.presenceChanged(code);
    expect(h.scheduler.tasks.has(`${code}:cleanup`)).toBe(true);
    h.presence.online.add("ana");
    h.lobby.presenceChanged(code);
    expect(h.scheduler.tasks.has(`${code}:cleanup`)).toBe(false);
    h.presence.online.delete("ana");
    h.lobby.presenceChanged(code);
    h.scheduler.runNext();
    expect(h.queries.lobby(code)).toBeNull();
  });

  it("la vista de la sala marca la conexión de cada humano y los bots siempre conectados", () => {
    const h = tableHarness();
    const code = created(h);
    h.lobby.addBot("ana");
    h.presence.online.add("ana");
    expect(h.queries.lobby(code)?.seats.map((s) => [s.playerId, s.connected, s.isBot])).toEqual([
      ["ana", true, false],
      ["bot:1", true, true],
    ]);
  });
});
