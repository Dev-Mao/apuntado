"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useCommandNotice } from "@/hooks/use-command-notice";
import { ROUTES } from "@/lib";

import { useRealtime } from "../context";

export function useLeaveRoom(evenIfRejected = false) {
  const router = useRouter();
  const { commands, clearRoom } = useRealtime();
  const { notice, run } = useCommandNotice();

  const leave = useCallback(async () => {
    if (!(await run(commands.leaveRoom)) && !evenIfRejected) return;
    clearRoom();
    router.push(ROUTES.HOME);
  }, [run, commands, clearRoom, router, evenIfRejected]);

  return { notice, leave };
}
