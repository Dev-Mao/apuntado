import { describe, expect, it } from "vitest";
import { SeededRandom } from "../../../../shared/random.js";
import { cardId } from "../entities/card.js";
import { createDeck, shuffle } from "../entities/deck.js";
import { ApuntadoRule } from "../rules/apuntado-rule.js";
import { ClassicRule } from "../rules/classic-rule.js";
import type { ClosureDeclaration } from "../rules/game-rule.js";
import { Round } from "./round.js";
import { c, cards, riggedDeck } from "./round.test-support.js";

const random = new SeededRandom(11);
const start = (players: string[], deck = shuffle(createDeck(), random)) => Round.start(players, deck, 0, random);
const ids = (xs: readonly { rank: string; suit: string }[]) => xs.map((x) => `${x.rank}${x.suit}`);

describe("Ronda · reparto", () => {
  it("reparte 10 cartas a cada jugador, una al pozo y el resto al mazo", () => {
    const round = start(["ana", "luis"]);
    expect(round.handOf("ana")).toHaveLength(10);
    expect(round.handOf("luis")).toHaveLength(10);
    expect(round.discardSize).toBe(1);
    expect(round.stockSize).toBe(31);
  });

  it("con cuatro jugadores quedan 11 cartas en el mazo", () => {
    expect(start(["a", "b", "c", "d"]).stockSize).toBe(11);
  });

  it("no admite menos de 2 ni más de 4 jugadores, ni jugadores repetidos", () => {
    expect(() => start(["solo"])).toThrow();
    expect(() => start(["a", "b", "c", "d", "e"])).toThrow();
    expect(() => start(["ana", "ana"])).toThrow();
  });
});

describe("Ronda · turno", () => {
  it("el jugador roba del mazo, descarta y pasa el turno", () => {
    const round = start(["ana", "luis"]);
    expect(round.drawFromStock("ana")).toEqual({ ok: true });
    expect(round.handOf("ana")).toHaveLength(11);
    expect(round.discard("ana", round.handOf("ana")[0]!)).toEqual({ ok: true });
    expect(round.currentPlayerId).toBe("luis");
    expect(round.currentPhase).toBe("DRAW");
  });

  it("solo puede tomar la carta superior del pozo", () => {
    const round = start(["ana", "luis"]);
    const top = round.discardTop!;
    round.drawFromDiscard("ana");
    expect(ids(round.handOf("ana"))).toContain(cardId(top));
    expect(round.discardSize).toBe(0);
  });

  it.each([
    ["robar fuera de turno", (r: Round) => r.drawFromStock("luis"), "No es su turno"],
    ["descartar sin haber robado", (r: Round) => r.discard("ana", r.handOf("ana")[0]!), "Primero debe robar una carta"],
  ])("rechaza %s sin alterar el estado", (_caso, action, reason) => {
    const round = start(["ana", "luis"]);
    const before = { hand: ids(round.handOf("ana")), stock: round.stockSize, pile: round.discardSize };
    expect(action(round)).toEqual({ ok: false, reason });
    expect({ hand: ids(round.handOf("ana")), stock: round.stockSize, pile: round.discardSize }).toEqual(before);
    expect(round.currentPlayerId).toBe("ana");
  });

  it("no permite robar dos veces en el mismo turno", () => {
    const round = start(["ana", "luis"]);
    round.drawFromStock("ana");
    expect(round.drawFromDiscard("ana")).toEqual({ ok: false, reason: "Ya robó una carta en este turno" });
  });

  it("no permite descartar la carta que acaba de tomar del pozo", () => {
    const round = start(["ana", "luis"]);
    const top = round.discardTop!;
    round.drawFromDiscard("ana");
    expect(round.discard("ana", top)).toEqual({ ok: false, reason: "No puede descartar la carta que acaba de tomar del pozo" });
  });

  it("no permite descartar una carta que no está en la mano", () => {
    const round = start(["ana", "luis"]);
    round.drawFromStock("ana");
    const foreign = round.handOf("luis")[0]!;
    expect(round.discard("ana", foreign)).toEqual({ ok: false, reason: "La carta no está en su mano" });
  });
});

describe("Ronda · mazo agotado", () => {
  const playStockTurns = (round: Round, turns: number) => {
    for (let i = 0; i < turns; i++) {
      const player = round.currentPlayerId;
      round.drawFromStock(player);
      round.discard(player, round.handOf(player).at(-1)!);
    }
  };

  it("recicla el pozo barajado y deja su carta superior", () => {
    const round = start(["a", "b", "c", "d"]);
    playStockTurns(round, 11);
    const top = round.discardTop!;
    expect(round.stockSize).toBe(0);
    round.drawFromStock(round.currentPlayerId);
    expect(round.discardTop).toEqual(top);
    expect(round.discardSize).toBe(1);
    expect(round.stockSize).toBe(10);
    expect(round.currentStatus).toBe("PLAYING");
  });

  it("si hace falta un segundo reciclaje, la ronda termina sin ganador", () => {
    const round = start(["a", "b", "c", "d"]);
    playStockTurns(round, 22);
    expect(round.stockSize).toBe(0);
    round.drawFromStock(round.currentPlayerId);
    expect(round.currentStatus).toBe("EXHAUSTED");
    expect(round.result).toBeNull();
  });
});

describe("Ronda · cierre clásico", () => {
  const deck = riggedDeck(["7H 7S 7D 7C KH KS KD 4C 4D 4H", "2C 3C 5C 6C 8C 9C 10C JC QC 2D"], "AC", "9S");
  const closure: ClosureDeclaration = {
    type: "CLASICO", melds: [cards("7H 7S 7D 7C"), cards("KH KS KD"), cards("4C 4D 4H")], leftovers: [], discard: c("9S"),
  };

  it("un cierre válido termina la ronda con ganador y deja el descarte en el pozo", () => {
    const round = start(["ana", "luis"], deck);
    round.drawFromStock("ana");
    expect(round.declareClosure("ana", closure, new ClassicRule()).valid).toBe(true);
    expect(round.currentStatus).toBe("CLOSED");
    expect(round.result).toEqual({ winnerId: "ana", type: "CLASICO" });
    expect(round.discardTop).toEqual(c("9S"));
  });

  it("no se puede cerrar antes de robar", () => {
    const round = start(["ana", "luis"], deck);
    expect(round.declareClosure("ana", closure, new ClassicRule()).reason).toBe("Primero debe robar una carta");
  });

  it("las cartas declaradas deben ser exactamente las de la mano", () => {
    const round = start(["ana", "luis"], deck);
    round.drawFromStock("ana");
    const tampered = { ...closure, melds: [cards("7H 7S 7D 7C"), cards("KH KS KD"), cards("4C 4D 4S")] };
    expect(round.declareClosure("ana", tampered, new ClassicRule()).reason).toBe("Las cartas declaradas no coinciden con su mano");
  });

  it("un cierre inválido no altera el estado ni consume el turno", () => {
    const round = start(["ana", "luis"], deck);
    round.drawFromStock("ana");
    const wrong = { ...closure, melds: [cards("7H 7S 7D"), cards("7C KH KS KD"), cards("4C 4D 4H")] };
    expect(round.declareClosure("ana", wrong, new ClassicRule()).valid).toBe(false);
    expect(round.currentStatus).toBe("PLAYING");
    expect(round.handOf("ana")).toHaveLength(11);
    expect(round.discard("ana", c("9S"))).toEqual({ ok: true });
  });

  it("al terminar la ronda ya no se aceptan jugadas", () => {
    const round = start(["ana", "luis"], deck);
    round.drawFromStock("ana");
    round.declareClosure("ana", closure, new ClassicRule());
    expect(round.drawFromStock("luis")).toEqual({ ok: false, reason: "La ronda ya terminó" });
  });
});

describe("Ronda · cierre por apuntado", () => {
  const ternas = [cards("3H 3S 3D"), cards("9C 9H 9S"), cards("QH QS QD")];
  const other = "2C 4C 5C 6C 7C 8C 10C JC KC 2S";
  const apuntado = (leftovers: string, discard: string | null): ClosureDeclaration =>
    ({ type: "APUNTADO", melds: ternas, leftovers: cards(leftovers), discard: discard ? c(discard) : null });

  it("toca sin descartar con dos sobrantes que suman menos de 5", () => {
    const round = start(["ana", "luis"], riggedDeck(["3H 3S 3D 9C 9H 9S QH QS QD AD", other], "KD", "AC"));
    round.drawFromStock("ana");
    expect(round.declareClosure("ana", apuntado("AD AC", null), new ApuntadoRule()).valid).toBe(true);
  });

  it("toca descartando primero y queda con una sobrante", () => {
    const round = start(["ana", "luis"], riggedDeck(["3H 3S 3D 9C 9H 9S QH QS QD 4D", other], "KD", "KH"));
    round.drawFromStock("ana");
    expect(round.declareClosure("ana", apuntado("4D", "KH"), new ApuntadoRule()).valid).toBe(true);
  });

  it("rechaza sobrantes que suman exactamente 5", () => {
    const round = start(["ana", "luis"], riggedDeck(["3H 3S 3D 9C 9H 9S QH QS QD 3C", other], "KD", "2D"));
    round.drawFromStock("ana");
    const result = round.declareClosure("ana", apuntado("3C 2D", null), new ApuntadoRule());
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("suman 5");
  });

  it("rechaza una terna incompleta", () => {
    const round = start(["ana", "luis"], riggedDeck(["3H 3S 3D 9C 9H 9S QH QS 2H AD", other], "KD", "AC"));
    round.drawFromStock("ana");
    const incomplete: ClosureDeclaration = {
      type: "APUNTADO", melds: [cards("3H 3S 3D"), cards("9C 9H 9S"), cards("QH QS")], leftovers: cards("2H AD AC"), discard: null,
    };
    expect(round.declareClosure("ana", incomplete, new ApuntadoRule()).valid).toBe(false);
  });
});

describe("Ronda · tiempo agotado", () => {
  it("rechaza el vencimiento de un jugador que no tiene el turno, en cualquier fase", () => {
    const round = start(["ana", "luis"]);
    expect(round.timeOut("luis")).toEqual({ ok: false, reason: "No es su turno" });
    round.drawFromDiscard("ana");
    expect(round.timeOut("fantasma")).toEqual({ ok: false, reason: "No es su turno" });
  });

  it("si no había robado, roba del mazo y descarta esa misma carta", () => {
    const round = start(["ana", "luis"], riggedDeck(["2C 3C 4C 5C 6C 7C 8C 9C 10C JC", "2D 3D 4D 5D 6D 7D 8D 9D 10D JD"], "KS", "QH"));
    const before = ids(round.handOf("ana"));
    expect(round.timeOut("ana")).toEqual({ ok: true });
    expect(ids(round.handOf("ana"))).toEqual(before);
    expect(round.discardTop).toEqual(c("QH"));
    expect(round.currentPlayerId).toBe("luis");
  });

  it("si tomó del pozo, descarta su carta de mayor valor distinta de la tomada", () => {
    const round = start(["ana", "luis"], riggedDeck(["AC 2C 3C 4C 5C 6C 7C 8C 9C KH", "2D 3D 4D 5D 6D 7D 8D 9D 10D JD"], "QS"));
    round.drawFromDiscard("ana");
    round.timeOut("ana");
    expect(round.discardTop).toEqual(c("KH"));
    expect(ids(round.handOf("ana"))).toContain("QS");
  });
});
