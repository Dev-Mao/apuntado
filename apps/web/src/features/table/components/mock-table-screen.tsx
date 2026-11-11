"use client";

import { useMockTable } from "../hooks";
import { MOCK_TABLE_SNAPSHOT } from "../mock-data";
import { TableScreen } from "./table-screen";

export function MockTableScreen() {
  const table = useMockTable(MOCK_TABLE_SNAPSHOT);
  return <TableScreen {...table} />;
}
