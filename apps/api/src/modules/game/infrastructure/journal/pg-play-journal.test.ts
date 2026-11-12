import { describe, expect, it } from "vitest";
import { createDatabase } from "../../../../shared/database/database.js";
import type { SqlClient, SqlExecutor, SqlValue } from "../../../../shared/database/sql-client.js";
import type { PlayJournalEntry } from "../../application/ports/index.js";
import { DeclareClosure } from "../../application/use-cases/declare-closure.js";
import { harness } from "../../application/use-cases/use-cases.test-support.js";
import { RuleResolver } from "../../domain/rules/rule-resolver.js";
import { c, cards, riggedDeck } from "../../domain/round/round.test-support.js";
import { PgPlayJournal } from "./pg-play-journal.js";

class GatedSql implements SqlClient {
  readonly written: (readonly SqlValue[])[] = [];
  private release: () => void = () => {};
  private readonly gate = new Promise<void>((resolve) => (this.release = resolve));

  constructor(private failuresLeft = 0) {}

  async query<Row extends object>(_text: string, params: readonly SqlValue[] = []): Promise<Row[]> {
    await this.gate;
    if (this.failuresLeft > 0) {
      this.failuresLeft -= 1;
      throw new Error("connection lost");
    }
    this.written.push(params);
    return [{ id: this.written.length } as Row];
  }

  async script(): Promise<void> {}

  async transaction(work: (tx: SqlExecutor) => Promise<void>): Promise<void> {
    await work(this);
  }

  async close(): Promise<void> {}

  open(): void {
    this.release();
  }
}

const entry = (seat: number, roundNumber: number, action: PlayJournalEntry["action"]): PlayJournalEntry => ({
  gameId: "ABCD",
  matchId: "m1",
  roundNumber,
  playerId: `p${seat}`,
  seat,
  action,
  cardId: "7H",
  occurredAt: new Date(0),
});

const DECK = riggedDeck(["2C 3C 4C 6C 8C 10C JC QC 2D 3D", "7H 7S 7D 9H 9S 9D KH KS KD 5D"], "QS", "AC");
const VALID = {
  type: "APUNTADO" as const,
  melds: [cards("7H 7S 7D"), cards("9H 9S 9D"), cards("KH KS KD")],
  leftovers: cards("AC"),
  discard: c("5D"),
};

describe("C-07 · la bitácora queda fuera del camino crítico", () => {
  it("DeclararCierre responde mientras la escritura de la bitácora sigue pendiente", async () => {
    const sql = new GatedSql();
    const database = createDatabase(sql, () => {});
    const h = harness(DECK);
    h.session.drawFromStock("ana");
    const declare = new DeclareClosure(h.games, new RuleResolver(), new PgPlayJournal(database), h.events, h.clock);

    expect(declare.execute({ gameId: "g1", playerId: "ana", declaration: VALID }).valid).toBe(true);
    expect(h.session.currentStatus).toBe("ROUND_OVER");
    expect(sql.written).toHaveLength(0);

    sql.open();
    await database.queue.idle();
    expect(sql.written).toHaveLength(1);
    expect(sql.written[0]).toEqual(["m1", 1, 2, 1, 1, "DECLARAR_CIERRE", "5D", h.clock.now()]);
  });
});

describe("Bitácora en PostgreSQL", () => {
  it("numera los turnos por cambio de asiento y las jugadas dentro de cada turno", async () => {
    const sql = new GatedSql();
    const database = createDatabase(sql, () => {});
    const journal = new PgPlayJournal(database);
    journal.record(entry(1, 1, "ROBAR_MAZO"));
    journal.record(entry(1, 1, "DESCARTAR"));
    journal.record(entry(2, 1, "ROBAR_POZO"));
    journal.record(entry(2, 2, "ROBAR_MAZO"));
    sql.open();
    await database.queue.idle();
    expect(sql.written.map((p) => [p[1], p[3], p[4], p[5]])).toEqual([
      [1, 1, 1, "ROBAR_MAZO"],
      [1, 1, 2, "DESCARTAR"],
      [1, 2, 1, "ROBAR_POZO"],
      [2, 1, 1, "ROBAR_MAZO"],
    ]);
  });

  it("una escritura fallida se informa y no detiene las siguientes", async () => {
    const sql = new GatedSql(1);
    const errors: unknown[] = [];
    const database = createDatabase(sql, (error) => errors.push(error));
    const journal = new PgPlayJournal(database);
    journal.record(entry(1, 1, "ROBAR_MAZO"));
    journal.record(entry(1, 1, "DESCARTAR"));
    sql.open();
    await database.queue.idle();
    expect(errors).toHaveLength(1);
    expect(sql.written.map((p) => p[5])).toEqual(["DESCARTAR"]);
  });
});
