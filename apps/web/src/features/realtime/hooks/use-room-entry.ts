"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { homeHref, ROOM_CODE_PARAM, ROUTES } from "@/lib";

import { useRealtime } from "../context";

export function useRoomCode(): string | null {
  return useSearchParams().get(ROOM_CODE_PARAM);
}

export function useRoomEntry(code: string | null) {
  const router = useRouter();
  const { session, connection, connectCount, commands, receivedSinceConnect, clearRoom, setEntryNotice } = useRealtime();

  useEffect(() => {
    if (code === null) router.replace(ROUTES.HOME);
    else if (session.status === "none") router.replace(homeHref(code));
  }, [session.status, code, router]);

  useEffect(() => {
    if (connection !== "connected" || code === null) return;
    let active = true;
    commands.joinRoom(code).then(
      (result) => {
        if (!active) return;
        setEntryNotice(result.ok ? null : result.reason);
        if (receivedSinceConnect()) return;
        clearRoom();
        router.replace(ROUTES.HOME);
      },
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, [connection, connectCount, code, commands, receivedSinceConnect, clearRoom, setEntryNotice, router]);
}
