import { createDatabase, type Database } from "./database.js";
import { runMigrations } from "./migrations.js";
import { PgSqlClient } from "./pg-sql-client.js";

export interface DatabaseLog {
  info(message: string): void;
  error(error: unknown): void;
}

export const openDatabase = async (connectionString: string, log: DatabaseLog): Promise<Database> => {
  const sql = new PgSqlClient(connectionString);
  const applied = await runMigrations(sql);
  log.info(applied.length ? `Migraciones aplicadas: ${applied.join(", ")}` : "Esquema al día");
  return createDatabase(sql, (error) => log.error(error));
};
