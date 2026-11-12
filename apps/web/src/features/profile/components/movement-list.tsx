"use client";

import { useTranslation } from "react-i18next";

import { useFreshWallet } from "@/features/account";
import { cn } from "@/lib";

import { useMatchFormat } from "../hooks";

const MINUS = "−";

function signed(amount: number): string {
  return amount > 0 ? `+${amount}` : `${MINUS}${Math.abs(amount)}`;
}

export function MovementList() {
  const { t } = useTranslation();
  const format = useMatchFormat();
  const { status, wallet } = useFreshWallet();

  if (!wallet) {
    const failed = status === "failed";
    return (
      <p role={failed ? "alert" : "status"} className="py-4 text-xl text-ink-soft italic">
        {failed ? t("profile.movements.failed") : t("profile.movements.loading")}
      </p>
    );
  }
  if (wallet.movements.length === 0) return <p className="py-4 text-xl text-ink-soft italic">{t("profile.movements.empty")}</p>;

  return (
    <ol className="min-h-0 divide-y divide-line overflow-y-auto overscroll-contain [mask-image:linear-gradient(to_bottom,black_calc(100%-1.25rem),transparent)]">
      {wallet.movements.map((movement) => (
        <li key={`${movement.at}-${movement.reason}-${movement.matchId ?? ""}`} className="flex items-center justify-between gap-4 py-3">
          <p className="min-w-0">
            <span className="block text-xl italic">{t(`profile.movements.reason.${movement.reason}`)}</span>
            <time dateTime={movement.at} className="label-caps text-[0.55rem] text-ink-soft">
              {format.date(movement.at)}
            </time>
          </p>
          <p className={cn("font-display text-[1.6rem] leading-none font-semibold tabular-nums lining-nums", movement.amount > 0 ? "text-coral-ink" : "text-ink")}>
            {signed(movement.amount)}
          </p>
        </li>
      ))}
    </ol>
  );
}
