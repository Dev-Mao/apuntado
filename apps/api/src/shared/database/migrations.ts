import { readFile } from "node:fs/promises";
import type { SqlClient } from "./sql-client.js";

export interface Migration {
  readonly id: string;
  readonly file: URL;
}

export const MIGRATIONS: readonly Migration[] = [
  { id: "001-esquema-e2", file: new URL("../../../../../models/er/schema.sql", import.meta.url) },
  { id: "002-catalogo-de-cartas", file: new URL("../../../migrations/002-catalogo-de-cartas.sql", import.meta.url) },
  { id: "003-ronda-sin-ganador", file: new URL("../../../migrations/003-ronda-sin-ganador.sql", import.meta.url) },
];

const LEDGER = `CREATE TABLE IF NOT EXISTS migracion_aplicada (
  id          TEXT PRIMARY KEY,
  aplicada_en TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

export const runMigrations = async (sql: SqlClient, migrations: readonly Migration[] = MIGRATIONS): Promise<string[]> => {
  await sql.script(LEDGER);
  const done = new Set((await sql.query<{ id: string }>("SELECT id FROM migracion_aplicada")).map((row) => row.id));
  const applied: string[] = [];
  for (const migration of migrations.filter((m) => !done.has(m.id))) {
    const text = await readFile(migration.file, "utf8");
    await sql.transaction(async (tx) => {
      await tx.script(text);
      await tx.query("INSERT INTO migracion_aplicada (id) VALUES ($1)", [migration.id]);
    });
    applied.push(migration.id);
  }
  return applied;
};
