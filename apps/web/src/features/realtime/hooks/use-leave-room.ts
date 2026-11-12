"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useCommandNotice } from "@/hooks/use-command-notice";
import { ROUTES } from "@/lib";

import { useRealtime } from "../context";

export function useLeaveRoom() {
  const router = useRouter();
  const { commands, clearRoom } = useRealtime();
  const { notice, run } = useCommandNotice();

  const leave = useCallback(async () => {
    if (!(await run(commands.leaveRoom))) return;
    clearRoom();
    router.push(ROUTES.HOME);
  }, [run, commands, clearRoom, router]);

  return { notice, leave };
}
