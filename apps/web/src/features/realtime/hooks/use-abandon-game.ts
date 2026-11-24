"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";

import { useCommandNotice } from "@/hooks/use-command-notice";
import { ROUTES } from "@/lib";

import { useRealtime } from "../context";
import { useRoomCode } from "./use-room-entry";

export function useAbandonGame() {
  const { t } = useTranslation();
  const router = useRouter();
  const code = useRoomCode();
  const { commands, clearRoom, setLeftCode, setEntryNotice } = useRealtime();
  const { notice, run } = useCommandNotice();
  const [pending, setPending] = useState(false);

  const abandon = useCallback(async () => {
    setPending(true);
    const done = await run(commands.abandon);
    setPending(false);
    if (!done) return;
    setEntryNotice(t("table.abandon.done", { code }));
    setLeftCode(code);
    clearRoom();
    router.replace(ROUTES.HOME);
  }, [run, commands, code, t, setEntryNotice, setLeftCode, clearRoom, router]);

  return { notice, pending, abandon };
}
