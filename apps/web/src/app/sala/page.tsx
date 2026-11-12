import { Suspense } from "react";

import { LobbyContainer } from "@/features/lobby";
import { RoomLoading } from "@/features/realtime";

export default function LobbyPage() {
  return (
    <Suspense fallback={<RoomLoading />}>
      <LobbyContainer />
    </Suspense>
  );
}
