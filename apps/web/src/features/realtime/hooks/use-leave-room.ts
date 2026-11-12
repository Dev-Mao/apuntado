"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useCommandNotice } from "@/hooks/use-command-notice";
import { ROUTES } from "@/lib";

import { useRealtime } from "../context";
import { useRoomCode } from "./use-room-entry";

export function useLeaveRoom(evenIfRejected = false) {
  const router = useRouter();
  const code = useRoomCode();
  const { commands, clearRoom, setLeftCode } = useRealtime();
  const { notice, run } = useCommandNotice();

  const leave = useCallback(async () => {
    if (!(await run(commands.leaveRoom)) && !evenIfRejected) return;
    setLeftCode(code);
    clearRoom();
    router.replace(ROUTES.HOME);
  }, [run, commands, code, setLeftCode, clearRoom, router, evenIfRejected]);

  return { notice, leave };
}
