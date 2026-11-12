import pg from "pg";
import type { SqlClient, SqlExecutor, SqlValue } from "./sql-client.js";

const POOL_SIZE = 5;

const executor = (target: pg.Pool | pg.PoolClient): SqlExecutor => ({
  async query<Row extends object>(text: string, params: readonly SqlValue[] = []): Promise<Row[]> {
    const result = await target.query<Row>(text, [...params]);
    return result.rows;
  },
  async script(text: string): Promise<void> {
    await target.query(text);
  },
});

export class PgSqlClient implements SqlClient {
  private readonly pool: pg.Pool;
  private readonly direct: SqlExecutor;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString, max: POOL_SIZE });
    this.direct = executor(this.pool);
  }

  query<Row extends object>(text: string, params?: readonly SqlValue[]): Promise<Row[]> {
    return this.direct.query<Row>(text, params);
  }

  script(text: string): Promise<void> {
    return this.direct.script(text);
  }

  async transaction(work: (tx: SqlExecutor) => Promise<void>): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await work(executor(client));
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  close(): Promise<void> {
    return this.pool.end();
  }
}
