import type { SqlClient } from "./sql-client.js";
import { WriteQueue } from "./write-queue.js";

export interface Database {
  readonly sql: SqlClient;
  readonly queue: WriteQueue;
}

export const createDatabase = (sql: SqlClient, onError: (error: unknown) => void): Database => ({
  sql,
  queue: new WriteQueue(onError),
});

export const closeDatabase = async ({ sql, queue }: Database): Promise<void> => {
  await queue.idle();
  await sql.close();
};
