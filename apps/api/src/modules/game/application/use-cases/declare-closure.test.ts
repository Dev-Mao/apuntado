import { beforeEach, describe, expect, it } from "vitest";
import { card } from "../../domain/entities/card.js";
import type { ClosureDeclaration } from "../../domain/rules/game-rule.js";
import { RuleResolver } from "../../domain/rules/rule-resolver.js";
import { FixedClock } from "../../../../shared/clock.js";
import { InMemoryGameRepository } from "../../infrastructure/repositories/in-memory-game-repository.js";
import type { EventBus, PlayJournal, PlayJournalEntry } from "../ports/index.js";
import { DeclareClosure } from "./declare-closure.js";

/**
 * C-06 (ADR-05): una declaración de cierre inválida no publica ningún evento ni escribe en la
 * bitácora. Es la garantía de RN-03: una jugada inválida no altera el estado ni consume el turno.
 */
class BitacoraEspia implements PlayJournal {
  readonly entradas: PlayJournalEntry[] = [];
  record(entry: PlayJournalEntry): void {
    this.entradas.push(entry);
  }
}

class EventosEspia implements EventBus {
  readonly publicados: string[] = [];
  publish(eventName: string): void {
    this.publicados.push(eventName);
  }
}

const terna = (rank: "7" | "9" | "K") =>
  [card(rank, "H"), card(rank, "S"), card(rank, "D")] as const;

const apuntadoValido: ClosureDeclaration = {
  type: "APUNTADO",
  melds: [terna("7"), terna("9"), terna("K")],
  leftovers: [card("A", "D"), card("A", "C")],
  discard: null,
};

const apuntadoInvalido: ClosureDeclaration = {
  ...apuntadoValido,
  leftovers: [card("K", "C"), card("9", "C")], // suman 19: deben sumar menos de 5
};

let bitacora: BitacoraEspia;
let eventos: EventosEspia;
let casoDeUso: DeclareClosure;

beforeEach(() => {
  const partidas = new InMemoryGameRepository();
  partidas.save({
    gameId: "g1", currentPlayerId: "ana", enabledClosures: ["CLASICO", "APUNTADO"], eliminationThreshold: 101,
  });
  bitacora = new BitacoraEspia();
  eventos = new EventosEspia();
  casoDeUso = new DeclareClosure(partidas, new RuleResolver(), bitacora, eventos, new FixedClock(new Date(0)));
});

const declarar = (playerId: string, declaration: ClosureDeclaration, gameId = "g1") =>
  casoDeUso.execute({ gameId, playerId, declaration });

describe("C-06 · una declaración inválida no deja rastro", () => {
  it("un cierre que no cumple la regla se rechaza sin evento ni bitácora", () => {
    const resultado = declarar("ana", apuntadoInvalido);
    expect(resultado.valid).toBe(false);
    expect(resultado.reason).toContain("sobrantes");
    expect(eventos.publicados).toHaveLength(0);
    expect(bitacora.entradas).toHaveLength(0);
  });

  it("declarar fuera de turno se rechaza sin evento ni bitácora", () => {
    const resultado = declarar("luis", apuntadoValido);
    expect(resultado.valid).toBe(false);
    expect(resultado.reason).toBe("No es su turno");
    expect(eventos.publicados).toHaveLength(0);
    expect(bitacora.entradas).toHaveLength(0);
  });

  it("declarar en una partida inexistente se rechaza sin evento ni bitácora", () => {
    const resultado = declarar("ana", apuntadoValido, "no-existe");
    expect(resultado.valid).toBe(false);
    expect(eventos.publicados).toHaveLength(0);
    expect(bitacora.entradas).toHaveLength(0);
  });

  it("tras un rechazo, el mismo jugador conserva el turno y puede volver a intentarlo", () => {
    declarar("ana", apuntadoInvalido);
    expect(declarar("ana", apuntadoValido).valid).toBe(true);
  });
});

describe("Contraste: un cierre válido sí deja rastro", () => {
  it("publica un evento y registra una entrada en la bitácora", () => {
    const resultado = declarar("ana", apuntadoValido);
    expect(resultado.valid).toBe(true);
    expect(eventos.publicados).toEqual(["RondaCerrada"]);
    expect(bitacora.entradas).toHaveLength(1);
  });
});
