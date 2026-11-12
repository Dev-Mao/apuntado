"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib";

import { useTurnCountdown } from "../hooks";

const URGENT_SECONDS = 10;

interface TurnTimerProps {
  turnDeadline: string | null;
  serverTime: string;
  className?: string | undefined;
  unitClassName?: string | undefined;
  urgentClassName?: string | undefined;
}

export function TurnTimer({ turnDeadline, serverTime, className, unitClassName, urgentClassName = "text-salmon" }: TurnTimerProps) {
  const { t } = useTranslation();
  const left = useTurnCountdown(turnDeadline, serverTime);

  if (left === null) return null;
  const urgent = left <= URGENT_SECONDS;
  return (
    <p
      role="timer"
      aria-label={t("table.turn.secondsLeft", { count: left })}
      className={cn("leading-none tabular-nums", urgent && cn("animate-urgent", urgentClassName), className)}
    >
      <span>{left}</span>
      <span className={cn("ml-0.5 text-[0.6em] italic", unitClassName)}>{t("table.turn.secondsUnit")}</span>
    </p>
  );
}
