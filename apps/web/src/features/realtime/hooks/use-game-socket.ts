"use client";

import { useCallback, useRef, useState } from "react";

import { createGameConnection } from "@/lib";

import { EMPTY_ROOM, withLobby, withSnapshot } from "../room-state";

import type { ConnectionStatus, RoomState } from "../types";

export function useGameSocket(onRejected: () => void, onConnected: () => void) {
  const [link] = useState(createGameConnection);
  const [connection, setConnection] = useState<ConnectionStatus>("idle");
  const [connectCount, setConnectCount] = useState(0);
  const [room, setRoom] = useState<RoomState>(EMPTY_ROOM);
  const freshRef = useRef(false);

  const close = useCallback(() => {
    link.close();
    setConnection("idle");
  }, [link]);

  const open = useCallback(() => {
    const opened = link.open({
      onConnect: () => {
        freshRef.current = false;
        setConnection("connected");
        setConnectCount((count) => count + 1);
        onConnected();
      },
      onLost: () => setConnection("reconnecting"),
      onRejected: () => {
        setConnection("reconnecting");
        onRejected();
      },
      onLobby: (lobby) => {
        freshRef.current = true;
        setRoom((prev) => withLobby(prev, lobby));
      },
      onSnapshot: (snapshot) => {
        freshRef.current = true;
        setRoom((prev) => withSnapshot(prev, snapshot));
      },
    });
    if (opened) setConnection("connecting");
  }, [link, onRejected, onConnected]);

  const receivedSinceConnect = useCallback(() => freshRef.current, []);

  const clearRoom = useCallback(() => {
    freshRef.current = false;
    setRoom(EMPTY_ROOM);
  }, []);

  return { connection, connectCount, room, commands: link.commands, open, close, receivedSinceConnect, clearRoom };
}
