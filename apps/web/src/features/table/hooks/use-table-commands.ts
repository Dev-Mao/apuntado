"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { useRealtime } from "@/features/realtime";

import type { TableActions } from "../types";
import type { ActionResult } from "@apuntado/contracts";

export function useTableCommands() {
  const { commands } = useRealtime();
  const inFlightRef = useRef<Promise<ActionResult> | null>(null);
  const [pending, setPending] = useState(false);

  const once = useCallback((command: () => Promise<ActionResult>) => {
    if (inFlightRef.current) return inFlightRef.current;
    setPending(true);
    const request = command().finally(() => {
      inFlightRef.current = null;
      setPending(false);
    });
    inFlightRef.current = request;
    return request;
  }, []);

  const actions = useMemo<TableActions>(
    () => ({
      onDrawFromStock: () => once(() => commands.draw("STOCK")),
      onDrawFromDiscard: () => once(() => commands.draw("DISCARD")),
      onDiscard: (card) => once(() => commands.discard(card)),
      onDeclareClosure: (declaration) => once(() => commands.declare(declaration)),
    }),
    [commands, once],
  );

  return { actions, pending };
}
