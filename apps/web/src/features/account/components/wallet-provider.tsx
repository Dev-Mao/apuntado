"use client";

import { WalletContext } from "../context";
import { useWalletStore } from "../hooks/use-wallet-store";

import type { ReactNode } from "react";

export function WalletProvider({ children }: { children: ReactNode }) {
  const value = useWalletStore();
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
