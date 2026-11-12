"use client";

import { useId } from "react";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib";

import { TurnTimer } from "./turn-timer";

interface TurnPanelProps {
  isMine: boolean;
  message: string;
  waitingFor: string;
  notice: string | null;
  turnKey: string;
  turnDeadline: string | null;
  serverTime: string;
  className?: string | undefined;
}

export function TurnPanel({ isMine, message, waitingFor, notice, turnKey, turnDeadline, serverTime, className }: TurnPanelProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const hint = notice ?? (isMine ? message : "");

  return (
    <section aria-labelledby={titleId} className={cn("flex flex-col gap-2", className)}>
      <h2 id={titleId} className="label-caps text-[0.62rem] text-ink-soft short:sr-only">
        {t("table.turn.title")}
      </h2>
      <div className="flex items-stretch">
        <p
          key={turnKey}
          aria-live="polite"
          className={cn(
            "min-w-0 flex-1 animate-turn-in pt-2 pr-4 pb-1.5 pl-6 leading-tight italic [clip-path:polygon(0.9rem_0,100%_0,100%_100%,0_100%)]",
            isMine ? "bg-coral text-[1.6rem] short:text-[1.3rem] sm:text-[1.85rem]" : "bg-paper-deep text-[1.3rem] short:text-[1.1rem] sm:text-[1.45rem]",
          )}
        >
          {isMine ? t("table.turn.yours") : t("table.turn.waiting", { name: waitingFor })}
        </p>
        <span className="grid min-w-14 place-items-center bg-ink px-2 text-paper">
          <TurnTimer turnDeadline={turnDeadline} serverTime={serverTime} className="font-display text-xl font-semibold" unitClassName="text-paper/60" />
        </span>
      </div>
      <p aria-live="polite" className="min-h-5 text-[0.95rem] leading-snug text-ink-soft italic short:text-sm tiny:hidden">
        {hint}
      </p>
    </section>
  );
}
