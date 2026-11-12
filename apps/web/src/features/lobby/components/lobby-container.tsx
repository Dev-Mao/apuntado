"use client";

import { RoomLoading, useRealtime, useRoomCode, useRoomEntry, useRoomRedirect } from "@/features/realtime";
import { ROUTES } from "@/lib";

import { useLobbyActions } from "../hooks";
import { LobbyScreen } from "./lobby-screen";

export function LobbyContainer() {
  const code = useRoomCode();
  const { session, room } = useRealtime();
  const actions = useLobbyActions();
  useRoomEntry(code);
  useRoomRedirect(ROUTES.LOBBY, code);
  const { lobby } = room;

  if (session.status !== "ready" || lobby?.status !== "LOBBY" || lobby.code !== code) return <RoomLoading />;
  return (
    <LobbyScreen
      lobby={lobby}
      selfId={session.session.playerId}
      notice={actions.notice}
      onAddBot={actions.handleAddBot}
      onStart={actions.handleStart}
      onLeave={actions.handleLeave}
    />
  );
}
