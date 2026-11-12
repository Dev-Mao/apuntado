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

function activeCode(room: RoomState): string | null {
  const destination = roomDestination(room);
  return destination && !destination.finished ? destination.code : null;
}

function belongsToOldRoom(room: RoomState, code: string, finished: boolean): boolean {
  const active = activeCode(room);
  return finished && active !== null && active !== code;
}

export function hasActiveRoom(room: RoomState): boolean {
  return activeCode(room) !== null;
}

export function withLobby(room: RoomState, lobby: LobbyView): RoomState {
  if (belongsToOldRoom(room, lobby.code, lobby.status === "FINISHED")) return room;
  return { lobby, snapshot: room.snapshot?.code === lobby.code ? room.snapshot : null };
}

export function withSnapshot(room: RoomState, snapshot: TableSnapshot): RoomState {
  if (belongsToOldRoom(room, snapshot.code, snapshot.view.status === "FINISHED")) return room;
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
