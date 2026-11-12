"use client";

import { useCallback } from "react";

import { RoomLoading, useLeaveRoom, useRealtime, useRoomCode, useRoomEntry, useRoomRedirect } from "@/features/realtime";
import { ResultsScreen } from "@/features/results";
import { ROUTES } from "@/lib";

import { useTableCommands } from "../hooks";
import { TableScreen } from "./table-screen";

export function TableContainer() {
  const code = useRoomCode();
  const { room } = useRealtime();
  const { actions, pending } = useTableCommands();
  const { leave } = useLeaveRoom(true);
  const handleLeave = useCallback(() => void leave(), [leave]);
  useRoomEntry(code);
  useRoomRedirect(ROUTES.TABLE, code);
  const { snapshot } = room;

  if (!snapshot || snapshot.code !== code) return <RoomLoading />;
  if (snapshot.view.status === "PLAYING") return <TableScreen snapshot={snapshot} pending={pending} {...actions} />;
  return <ResultsScreen snapshot={snapshot} onLeave={handleLeave} />;
}
