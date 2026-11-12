"use client";

import { RealtimeContext } from "../context";
import { useRealtimeStore } from "../hooks";

import type { ReactNode } from "react";

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const value = useRealtimeStore();
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
