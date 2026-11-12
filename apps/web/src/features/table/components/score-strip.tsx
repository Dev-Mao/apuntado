"use client";

import { useTranslation } from "react-i18next";

import { cn, nicknameOf } from "@/lib";

import type { ScoreLineView, SeatView } from "@apuntado/contracts";

interface ScoreStripProps {
  entries: readonly ScoreLineView[];
  seats: readonly SeatView[];
  selfId: string;
  turnPlayerId: string | null;
  onOpen: () => void;
}

export function ScoreStrip({ entries, seats, selfId, turnPlayerId, onOpen }: ScoreStripProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t("table.scoreboard.open")}
      className="flex w-full items-center gap-1.5 overflow-x-auto px-3 pb-2 tiny:hidden lg:hidden"
    >
      {entries.map((entry) => (
        <span
          key={entry.playerId}
          aria-hidden="true"
          className={cn(
            "flex min-w-0 shrink-0 items-baseline gap-2 rounded-full px-3 pt-1.5 pb-1",
            entry.playerId === selfId ? "bg-coral" : "bg-paper-light shadow-[inset_0_0_0_1px_var(--color-line)]",
            entry.eliminated && "opacity-55",
          )}
        >
          {entry.playerId === turnPlayerId && <span className="size-1.5 self-center rounded-full bg-ink" />}
          <span className={cn("max-w-[5.5rem] truncate text-sm", entry.eliminated && "line-through")}>{nicknameOf(seats, entry.playerId)}</span>
          <span className="text-lg leading-none tabular-nums lining-nums">{entry.total}</span>
        </span>
      ))}
    </button>
  );
}
