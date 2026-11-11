"use client";

import { useTranslation } from "react-i18next";

import { ThresholdBar } from "@/components";
import { cn } from "@/lib";

import type { ScoreEntry } from "../types";

export const SCOREBOARD_ID = "marcador";

interface ScoreboardProps {
  entries: readonly ScoreEntry[];
  threshold: number;
  turnPlayerId: string;
}

export function Scoreboard({ entries, threshold, turnPlayerId }: ScoreboardProps) {
  const { t } = useTranslation();

  return (
    <section id={SCOREBOARD_ID} aria-labelledby="scoreboard-title" className="scroll-mt-6">
      <div className="flex items-baseline justify-between border-b border-ink pb-2">
        <h2 id="scoreboard-title" className="label-caps text-xs">
          {t("table.scoreboard.title")}
        </h2>
        <span className="font-display text-sm text-ink-soft italic">
          {t("table.scoreboard.threshold", { count: threshold })}
        </span>
      </div>
      <ol className="divide-y divide-line">
        {entries.map((entry) => (
          <li key={entry.playerId} className="flex flex-col gap-2 py-2.5">
            <span className="sr-only">
              {t("table.scoreboard.entryLabel", { name: entry.name, points: entry.points, threshold })}
              {entry.isEliminated && `, ${t("table.scoreboard.eliminated")}`}
            </span>
            <span aria-hidden="true" className="flex items-center gap-3">
              <span
                className={cn("size-2 shrink-0 rounded-full", entry.playerId === turnPlayerId ? "bg-coral" : "bg-ink/20")}
              />
              <span className={cn("flex-1 truncate font-display text-lg", entry.isEliminated && "text-ink-soft line-through")}>
                {entry.name}
              </span>
              {entry.isEliminated && (
                <span className="label-caps text-[0.58rem] text-coral-ink">{t("table.scoreboard.eliminated")}</span>
              )}
              <span className="font-display text-3xl leading-none tabular-nums">{entry.points}</span>
            </span>
            <ThresholdBar value={entry.points} max={threshold} />
          </li>
        ))}
      </ol>
    </section>
  );
}
