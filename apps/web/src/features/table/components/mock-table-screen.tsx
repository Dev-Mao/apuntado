"use client";

import { useMockTable } from "../hooks";
import { MOCK_TABLE_VIEW } from "../mock-data";
import { TableScreen } from "./table-screen";

export function MockTableScreen() {
  const table = useMockTable(MOCK_TABLE_VIEW);
  return <TableScreen {...table} />;
}
