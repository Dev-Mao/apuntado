import { RESULT_STATUS } from "./types";

import type { ResultRow } from "./types";

function weight(row: ResultRow): number {
  if (row.status === RESULT_STATUS.WINNER) return 0;
  return row.eliminated ? 2 : 1;
}

export function rankRows(rows: readonly ResultRow[]): ResultRow[] {
  return [...rows].sort((a, b) => weight(a) - weight(b) || a.total - b.total);
}
