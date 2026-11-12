import { Suspense } from "react";

import { RoomLoading } from "@/features/realtime";
import { TableContainer } from "@/features/table";

export default function TablePage() {
  return (
    <Suspense fallback={<RoomLoading />}>
      <TableContainer />
    </Suspense>
  );
}
