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
  const { session, connection, connectCount, commands, leftCode, receivedSinceConnect, clearRoom, setEntryNotice } = useRealtime();
  const left = code !== null && code === leftCode;

  useEffect(() => {
    if (code === null || left) router.replace(ROUTES.HOME);
    else if (session.status === "none") router.replace(homeHref(code));
  }, [session.status, code, left, router]);

  useEffect(() => {
    if (connection !== "connected" || code === null || left) return;
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
  }, [connection, connectCount, code, left, commands, receivedSinceConnect, clearRoom, setEntryNotice, router]);
}
