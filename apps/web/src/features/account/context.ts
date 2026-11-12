"use client";

import { createContext, useContext, useEffect } from "react";

import type { WalletContextValue } from "./types";

export const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet(): WalletContextValue {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used inside WalletProvider");
  return value;
}

export function useFreshWallet(): WalletContextValue {
  const value = useWallet();
  const { refresh } = value;
  useEffect(() => {
    refresh();
  }, [refresh]);
  return value;
}
