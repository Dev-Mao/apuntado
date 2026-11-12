import pg from "pg";
import type { SqlClient, SqlExecutor, SqlValue } from "./sql-client.js";

const POOL_SIZE = 5;
const CONNECTION_TIMEOUT_MS = 5000;
const STATEMENT_TIMEOUT_MS = 10_000;

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

  constructor(
    connectionString: string,
    private readonly onError: (error: unknown) => void,
  ) {
    this.pool = new pg.Pool({
      connectionString,
      max: POOL_SIZE,
      connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
      statement_timeout: STATEMENT_TIMEOUT_MS,
    });
    this.pool.on("error", onError);
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
      client.release();
    } catch (error) {
      await client.query("ROLLBACK").catch(this.onError);
      client.release(error instanceof Error ? error : true);
      throw error;
    }
  }

  close(): Promise<void> {
    return this.pool.end();
  }
}
