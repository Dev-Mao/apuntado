import { describe, expect, it } from "vitest";
import { ChipLedger, type StakeHold } from "../domain/chip-ledger.js";
import { InMemoryMovementStore } from "../infrastructure/in-memory-movement-store.js";
import { ChipBank } from "./chip-bank.js";

class SeededStore extends InMemoryMovementStore {
  constructor(private readonly pending: readonly StakeHold[] = []) {
    super();
  }

  override async unsettledHolds(): Promise<readonly StakeHold[]> {
    return this.pending;
  }
}

const bankWith = async (balances: Record<string, number>, store = new SeededStore()) => {
  for (const [playerId, amount] of Object.entries(balances)) {
    store.append([{ playerId, amount, reason: "BONO_BIENVENIDA", matchId: null }]);
  }
  const ledger = new ChipLedger();
  const bank = new ChipBank(ledger, store);
  await bank.open();
  return { bank, ledger, store };
};

const ledgerTotal = async (store: InMemoryMovementStore) => [...(await store.balances()).values()].reduce((a, b) => a + b, 0);

describe("Economía · bono y saldo", () => {
  it("el bono de bienvenida deja 1000 fichas y queda en el libro", async () => {
    const { bank, store } = await bankWith({});
    bank.grantWelcomeBonus("eva");
    expect(await bank.walletOf("eva")).toMatchObject({ balance: 1000, movements: [{ amount: 1000, reason: "BONO_BIENVENIDA" }] });
    expect((await store.balances()).get("eva")).toBe(1000);
  });

  it("al abrir, el saldo se reconstruye desde el libro de movimientos", async () => {
    const { bank } = await bankWith({ eva: 700 });
    expect(bank.canCover("eva", 700)).toBe(true);
    expect(bank.canCover("eva", 701)).toBe(false);
  });
});

describe("Economía · apuestas", () => {
  it("retener descuenta a cada jugador y el bote completo va al ganador", async () => {
    const { bank, ledger, store } = await bankWith({ eva: 1000, tom: 1000 });
    expect(bank.hold("m1", ["eva", "tom"], 100)).toEqual({ ok: true });
    expect([ledger.balanceOf("eva"), ledger.balanceOf("tom")]).toEqual([900, 900]);
    bank.matchStarted({ matchId: "m1" });
    bank.matchFinished({ matchId: "m1", winnerId: "tom" });
    expect([ledger.balanceOf("eva"), ledger.balanceOf("tom")]).toEqual([900, 1100]);
    expect(await store.balances()).toEqual(new Map([["eva", 900], ["tom", 1100]]));
    expect(await ledgerTotal(store)).toBe(2000);
  });

  it("si alguien no cubre la apuesta no se retiene nada a nadie", async () => {
    const { bank, ledger, store } = await bankWith({ eva: 1000, tom: 50 });
    expect(bank.hold("m1", ["eva", "tom"], 100).ok).toBe(false);
    bank.matchStarted({ matchId: "m1" });
    expect([ledger.balanceOf("eva"), ledger.balanceOf("tom")]).toEqual([1000, 50]);
    expect((await store.recent("eva", 10)).map((m) => m.reason)).toEqual(["BONO_BIENVENIDA"]);
  });

  it("la retención se escribe en el libro cuando la partida empieza, antes del bote", async () => {
    const { bank, store } = await bankWith({ eva: 300, tom: 300 });
    bank.hold("m1", ["eva", "tom"], 100);
    expect((await store.recent("eva", 10)).map((m) => m.reason)).toEqual(["BONO_BIENVENIDA"]);
    bank.matchStarted({ matchId: "m1" });
    bank.matchFinished({ matchId: "m1", winnerId: "eva" });
    expect((await store.recent("eva", 10)).map((m) => m.reason)).toEqual(["BOTE_GANADO", "APUESTA_RETENIDA", "BONO_BIENVENIDA"]);
  });

  it("una partida sin apuesta no mueve fichas al terminar", async () => {
    const { bank, ledger } = await bankWith({ eva: 300 });
    bank.matchFinished({ matchId: "otra", winnerId: "eva" });
    expect(ledger.balanceOf("eva")).toBe(300);
  });

  it("al abrir, devuelve las retenciones de partidas que quedaron sin liquidar", async () => {
    const pending = [{ matchId: "m9", playerIds: ["eva", "tom"], stake: 100 }];
    const store = new SeededStore(pending);
    store.append([
      { playerId: "eva", amount: -100, reason: "APUESTA_RETENIDA", matchId: "m9" },
      { playerId: "tom", amount: -100, reason: "APUESTA_RETENIDA", matchId: "m9" },
    ]);
    const { ledger } = await bankWith({ eva: 1000, tom: 1000 }, store);
    expect([ledger.balanceOf("eva"), ledger.balanceOf("tom")]).toEqual([1000, 1000]);
    expect((await store.recent("tom", 1))[0]).toMatchObject({ amount: 100, reason: "APUESTA_DEVUELTA", matchId: "m9" });
  });
});
