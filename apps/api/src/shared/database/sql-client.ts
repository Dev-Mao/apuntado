export type SqlValue = string | number | boolean | Date | null | readonly string[];

export interface SqlExecutor {
  query<Row extends object>(text: string, params?: readonly SqlValue[]): Promise<Row[]>;
  script(text: string): Promise<void>;
}

export interface SqlClient extends SqlExecutor {
  transaction(work: (tx: SqlExecutor) => Promise<void>): Promise<void>;
  close(): Promise<void>;
}
