"use client";

import { createContext, useContext } from "react";

import type { RealtimeContextValue } from "./types";

export const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function useRealtime(): RealtimeContextValue {
  const value = useContext(RealtimeContext);
  if (!value) throw new Error("useRealtime must be used inside RealtimeProvider");
  return value;
}
