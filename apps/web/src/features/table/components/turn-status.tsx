"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib";

import { useTurnCountdown } from "../hooks";

interface TurnStatusProps {
  message: string;
  turnDeadline: string | null;
  serverTime: string;
  isMyTurn: boolean;
}

export function TurnStatus({ message, turnDeadline, serverTime, isMyTurn }: TurnStatusProps) {
  const { t } = useTranslation();
  const left = useTurnCountdown(turnDeadline, serverTime);

  return (
    <section aria-labelledby="turn-title" className="rounded-3xl bg-felt px-5 pt-4 pb-5 text-paper">
      <div className="flex min-h-9 items-start justify-between gap-4">
        <h2 id="turn-title" className="label-caps flex items-center gap-2 pt-1 text-[0.62rem] text-paper/60">
          <span aria-hidden="true" className={cn("size-2 rounded-full", isMyTurn ? "bg-coral" : "bg-paper/40")} />
          {t("table.turn.title")}
        </h2>
        {left !== null && (
          <p role="timer" aria-label={t("table.turn.secondsLeft", { count: left })} className="font-display leading-none">
            <span className="text-4xl tabular-nums">{left}</span>
            <span className="ml-1 text-base text-paper/70 italic">{t("table.turn.secondsUnit")}</span>
          </p>
        )}
      </div>
      <p aria-live="polite" className={cn("mt-2 font-display text-2xl leading-tight", isMyTurn && "text-coral")}>
        {message}
      </p>
    </section>
  );
}
