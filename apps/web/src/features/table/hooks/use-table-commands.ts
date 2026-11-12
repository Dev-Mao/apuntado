"use client";

import { useMemo } from "react";

import { useRealtime } from "@/features/realtime";

import type { TableActions } from "../types";

export function useTableCommands(): TableActions {
  const { commands } = useRealtime();
  return useMemo(
    () => ({
      onDrawFromStock: () => commands.draw("STOCK"),
      onDrawFromDiscard: () => commands.draw("DISCARD"),
      onDiscard: commands.discard,
      onDeclareClosure: commands.declare,
    }),
    [commands],
  );
}
