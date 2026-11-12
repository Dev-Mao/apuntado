"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRealtime } from "@/features/realtime";
import { fetchWallet } from "@/lib";

import type { WalletContextValue, WalletStatus } from "../types";
import type { WalletView } from "@apuntado/contracts";

interface WalletState {
  readonly ownerId: string;
  readonly wallet: WalletView | null;
  readonly failed: boolean;
}

function statusOf(playerId: string | null, owned: WalletState | null): WalletStatus {
  if (!playerId) return "none";
  if (owned?.wallet) return "ready";
  return owned?.failed ? "failed" : "loading";
}

export function useWalletStore(): WalletContextValue {
  const { session, room } = useRealtime();
  const playerId = session.status === "ready" && !session.session.guest ? session.session.playerId : null;
  const finished = room.snapshot?.view.status === "FINISHED";
  const [state, setState] = useState<WalletState | null>(null);
  const stamp = useRef(0);

  const refresh = useCallback(() => {
    if (!playerId) return;
    const current = ++stamp.current;
    fetchWallet().then(
      (result) => {
        if (current !== stamp.current) return;
        setState({ ownerId: playerId, wallet: result.status === "ready" ? result.wallet : null, failed: result.status !== "ready" });
      },
      () => {
        if (current !== stamp.current) return;
        setState((prev) => ({ ownerId: playerId, wallet: prev?.ownerId === playerId ? prev.wallet : null, failed: true }));
      },
    );
  }, [playerId]);

  useEffect(() => {
    refresh();
  }, [refresh, finished]);

  const owned = state && state.ownerId === playerId ? state : null;
  const status = statusOf(playerId, owned);

  return useMemo(() => ({ status, wallet: owned?.wallet ?? null, refresh }), [status, owned, refresh]);
}
