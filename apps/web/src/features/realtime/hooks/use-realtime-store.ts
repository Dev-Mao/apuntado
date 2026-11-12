"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchSession, startGuestSession } from "@/lib";

import { useGameSocket } from "./use-game-socket";

import type { RealtimeContextValue, SessionState } from "../types";
import type { SessionView } from "@apuntado/contracts";

const RETRY_MS = 3000;
const MAX_REJECTED_RETRIES = 3;

export function useRealtimeStore(): RealtimeContextValue {
  const [session, setSession] = useState<SessionState>({ status: "checking" });
  const [entryNotice, setEntryNotice] = useState<string | null>(null);
  const [leftCode, setLeftCode] = useState<string | null>(null);
  const [rejections, setRejections] = useState(0);
  const handleRejected = useCallback(() => setRejections((count) => count + 1), []);
  const handleConnected = useCallback(() => setRejections(0), []);
  const socket = useGameSocket(handleRejected, handleConnected);
  const { connectCount, room, commands, open, close, receivedSinceConnect, clearRoom } = socket;
  const connection = rejections > MAX_REJECTED_RETRIES ? "failed" : socket.connection;

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
    checkSession();
    return close;
  }, [checkSession, close]);

  useEffect(() => {
    if (session.status !== "offline") return;
    const timer = window.setTimeout(checkSession, RETRY_MS);
    return () => window.clearTimeout(timer);
  }, [session, checkSession]);

  useEffect(() => {
    if (rejections === 0 || rejections > MAX_REJECTED_RETRIES) return;
    const timer = window.setTimeout(checkSession, RETRY_MS * 2 ** (rejections - 1));
    return () => window.clearTimeout(timer);
  }, [rejections, checkSession]);

  const startSession = useCallback(
    async (nickname: string) => {
      const result = await startGuestSession(nickname);
      if (!result.ok) return result;
      setRejections(0);
      if (session.status === "ready" && session.session.nickname !== result.session.nickname) close();
      applySession(result.session);
      return result;
    },
    [session, close, applySession],
  );

  return useMemo(
    () => ({
      session,
      connection,
      connectCount,
      room,
      entryNotice,
      leftCode,
      commands,
      startSession,
      receivedSinceConnect,
      clearRoom,
      setEntryNotice,
      setLeftCode,
    }),
    [session, connection, connectCount, room, entryNotice, leftCode, commands, startSession, receivedSinceConnect, clearRoom],
  );
}
