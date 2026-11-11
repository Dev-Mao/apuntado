import { beforeEach, describe, expect, it } from "vitest";
import type { ClosureDeclaration } from "../../domain/rules/game-rule.js";
import { RuleResolver } from "../../domain/rules/rule-resolver.js";
import { c, cards, riggedDeck } from "../../domain/round/round.test-support.js";
import { DeclareClosure } from "./declare-closure.js";
import { harness } from "./use-cases.test-support.js";

const DECK = riggedDeck(["2C 3C 4C 6C 8C 10C JC QC 2D 3D", "7H 7S 7D 9H 9S 9D KH KS KD 5D"], "QS", "AC");
const SETS = [cards("7H 7S 7D"), cards("9H 9S 9D"), cards("KH KS KD")];

const touching = (leftovers: string, discard: string | null): ClosureDeclaration =>
  ({ type: "APUNTADO", melds: SETS, leftovers: cards(leftovers), discard: discard ? c(discard) : null });

const INVALID = touching("5D AC", null);
const VALID = touching("AC", "5D");

let h: ReturnType<typeof harness>;
let useCase: DeclareClosure;

beforeEach(() => {
  h = harness(DECK);
  h.session.drawFromStock("ana");
  useCase = new DeclareClosure(h.games, new RuleResolver(), h.journal, h.events, h.clock);
});

const declare = (playerId: string, declaration: ClosureDeclaration, gameId = "g1") =>
  useCase.execute({ gameId, playerId, declaration });

describe("C-06 · una declaración inválida no deja rastro", () => {
  it("un cierre que no cumple la regla se rechaza sin evento ni bitácora", () => {
    const result = declare("ana", INVALID);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("sobrantes");
    expect(h.events.published).toHaveLength(0);
    expect(h.journal.entries).toHaveLength(0);
  });

  it("declarar fuera de turno se rechaza sin evento ni bitácora", () => {
    const result = declare("luis", VALID);
    expect(result.reason).toBe("No es su turno");
    expect(h.events.published).toHaveLength(0);
    expect(h.journal.entries).toHaveLength(0);
  });

  it("declarar en una partida inexistente se rechaza sin evento ni bitácora", () => {
    expect(declare("ana", VALID, "no-existe").reason).toBe("La partida no existe");
    expect(h.events.published).toHaveLength(0);
    expect(h.journal.entries).toHaveLength(0);
  });

  it("un cierre de una modalidad no habilitada se rechaza", () => {
    const h2 = harness(DECK, "CLASICA");
    h2.session.drawFromStock("ana");
    const classicOnly = new DeclareClosure(h2.games, new RuleResolver(), h2.journal, h2.events, h2.clock);
    expect(classicOnly.execute({ gameId: "g1", playerId: "ana", declaration: VALID }).reason)
      .toBe("La modalidad de cierre no está habilitada");
  });

  it("tras un rechazo, el mismo jugador conserva el turno y puede volver a intentarlo", () => {
    declare("ana", INVALID);
    expect(declare("ana", VALID).valid).toBe(true);
  });
});

describe("Contraste: un cierre válido sí deja rastro", () => {
  it("publica RondaCerrada y registra el cierre en la bitácora", () => {
    expect(declare("ana", VALID).valid).toBe(true);
    expect(h.events.names).toEqual(["RondaCerrada"]);
    expect(h.journal.entries).toMatchObject([{ action: "DECLARAR_CIERRE", playerId: "ana", cardId: "5D", roundNumber: 1 }]);
  });
});
