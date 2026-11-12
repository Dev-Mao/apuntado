import { PGlite, type Transaction } from "@electric-sql/pglite";
import type { SqlClient, SqlExecutor, SqlValue } from "../../apps/api/src/shared/database/sql-client.js";

type Target = PGlite | Transaction;

const executor = (target: Target): SqlExecutor => ({
  async query<Row extends object>(text: string, params: readonly SqlValue[] = []): Promise<Row[]> {
    return (await target.query<Row>(text, [...params])).rows;
  },
  async script(text: string): Promise<void> {
    await target.exec(text);
  },
});

export class PgliteSqlClient implements SqlClient {
  readonly db = new PGlite();
  private readonly direct = executor(this.db);

  query<Row extends object>(text: string, params?: readonly SqlValue[]): Promise<Row[]> {
    return this.direct.query<Row>(text, params);
  }

  script(text: string): Promise<void> {
    return this.direct.script(text);
  }

  async transaction(work: (tx: SqlExecutor) => Promise<void>): Promise<void> {
    await this.db.transaction((tx) => work(executor(tx)));
  }

  close(): Promise<void> {
    return this.db.close();
  }
}
