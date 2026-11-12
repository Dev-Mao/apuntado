"use client";

import { useCallback } from "react";

import { useLeaveRoom, useRealtime } from "@/features/realtime";
import { useCommandNotice } from "@/hooks/use-command-notice";

export function useLobbyActions() {
  const { commands } = useRealtime();
  const { notice, run } = useCommandNotice();
  const { notice: leaveNotice, leave } = useLeaveRoom();

  const handleAddBot = useCallback(() => void run(commands.addBot), [run, commands]);
  const handleStart = useCallback(() => void run(commands.startGame), [run, commands]);
  const handleLeave = useCallback(() => void leave(), [leave]);

  return { notice: leaveNotice ?? notice, handleAddBot, handleStart, handleLeave };
}
