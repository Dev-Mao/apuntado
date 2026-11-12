"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib";

import { useTurnCountdown } from "../hooks";

interface TurnTimerProps {
  turnDeadline: string | null;
  serverTime: string;
  className?: string | undefined;
  unitClassName?: string | undefined;
}

export function TurnTimer({ turnDeadline, serverTime, className, unitClassName }: TurnTimerProps) {
  const { t } = useTranslation();
  const left = useTurnCountdown(turnDeadline, serverTime);

  if (left === null) return null;
  return (
    <p role="timer" aria-label={t("table.turn.secondsLeft", { count: left })} className={cn("font-display leading-none", className)}>
      <span className="tabular-nums">{left}</span>
      <span className={cn("ml-1 text-base italic", unitClassName)}>{t("table.turn.secondsUnit")}</span>
    </p>
  );
}
