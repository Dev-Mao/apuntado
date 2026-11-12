"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib";

import { useWallet } from "../context";

export function ChipBalance({ className }: { className?: string | undefined }) {
  const { t } = useTranslation();
  const { status, wallet } = useWallet();
  if (status === "none" || !wallet) return null;
  const chips = t("common.chips", { count: wallet.balance });

  return (
    <span
      role="status"
      aria-label={t("account.balance", { chips })}
      className={cn("label-caps inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink/30 bg-paper-light px-3 pt-[0.35rem] pb-[0.3rem] text-[0.65rem] tabular-nums", className)}
    >
      <span aria-hidden="true" className="size-3 shrink-0 rounded-full border-[1.5px] border-ink bg-coral" />
      <span aria-hidden="true">{wallet.balance}</span>
    </span>
  );
}
