"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fetchSession, startGuestSession } from "@/lib";

import { useGameSocket } from "./use-game-socket";

import type { RealtimeContextValue, SessionState } from "../types";
import type { SessionView } from "@apuntado/contracts";

const RETRY_MS = 3000;

export function useRealtimeStore(): RealtimeContextValue {
  const [session, setSession] = useState<SessionState>({ status: "checking" });
  const recheckRef = useRef<() => void>(() => undefined);
  const handleRejected = useCallback(() => {
    window.setTimeout(() => recheckRef.current(), RETRY_MS);
  }, []);
  const { connection, connectCount, room, commands, open, close, receivedSinceConnect, clearRoom } = useGameSocket(handleRejected);

  const applySession = useCallback(
    (view: SessionView | null) => {
      setSession(view ? { status: "ready", session: view } : { status: "none" });
      if (view) return open();
      close();
      clearRoom();
    },
    [open, close, clearRoom],
  );

  const checkSession = useCallback(() => {
    fetchSession().then(applySession, () => setSession({ status: "offline" }));
  }, [applySession]);

  useEffect(() => {
    recheckRef.current = checkSession;
  }, [checkSession]);

  useEffect(() => {
    checkSession();
    return close;
  }, [checkSession, close]);

  useEffect(() => {
    if (session.status !== "offline") return;
    const timer = window.setTimeout(checkSession, RETRY_MS);
    return () => window.clearTimeout(timer);
  }, [session, checkSession]);

  const startSession = useCallback(
    async (nickname: string) => {
      const result = await startGuestSession(nickname);
      if (result.ok) applySession(result.session);
      return result;
    },
    [applySession],
  );

  return useMemo(
    () => ({ session, connection, connectCount, room, commands, startSession, receivedSinceConnect, clearRoom }),
    [session, connection, connectCount, room, commands, startSession, receivedSinceConnect, clearRoom],
  );
}
