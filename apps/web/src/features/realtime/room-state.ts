import { ROUTES } from "@/lib";

import type { RoomState } from "./types";
import type { RoomPage } from "@/lib";
import type { LobbyView, TableSnapshot } from "@apuntado/contracts";

export interface RoomDestination {
  readonly page: RoomPage;
  readonly code: string;
  readonly finished: boolean;
}

export const EMPTY_ROOM: RoomState = { lobby: null, snapshot: null };

export function withLobby(room: RoomState, lobby: LobbyView): RoomState {
  return { lobby, snapshot: room.snapshot?.code === lobby.code ? room.snapshot : null };
}

export function withSnapshot(room: RoomState, snapshot: TableSnapshot): RoomState {
  return { lobby: room.lobby?.code === snapshot.code ? room.lobby : null, snapshot };
}

export function roomDestination({ lobby, snapshot }: RoomState): RoomDestination | null {
  if (snapshot) return { page: ROUTES.TABLE, code: snapshot.code, finished: snapshot.view.status === "FINISHED" };
  if (!lobby) return null;
  return {
    page: lobby.status === "LOBBY" ? ROUTES.LOBBY : ROUTES.TABLE,
    code: lobby.code,
    finished: lobby.status === "FINISHED",
  };
}
