"use client";

import { useWallet } from "@/features/account";

export function useOverBalance(registered: boolean, stake: string): boolean {
  const { wallet } = useWallet();
  return registered && wallet !== null && Number(stake) > wallet.balance;
}
