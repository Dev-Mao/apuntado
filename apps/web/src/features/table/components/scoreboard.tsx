"use client";

import { useTranslation } from "react-i18next";

import { SuitGlyph, ThresholdBar } from "@/components";
import { cn, nicknameOf } from "@/lib";

import type { ScoreLineView, SeatView } from "@apuntado/contracts";

export interface ScoreboardProps {
  entries: readonly ScoreLineView[];
  seats: readonly SeatView[];
  threshold: number;
  selfId: string;
  turnPlayerId: string | null;
  bandClassName?: string | undefined;
}

interface ScoreRowProps {
  entry: ScoreLineView;
  name: string;
  threshold: number;
  isTurn: boolean;
  srLabel: string;
}

function SelfRow({ entry, name, threshold, isTurn, srLabel, bandClassName }: ScoreRowProps & { bandClassName: string }) {
  const { t } = useTranslation();
  return (
    <li className={cn("flex flex-col gap-1 bg-coral py-4", bandClassName)}>
      <span className="sr-only">{srLabel}</span>
      <span aria-hidden="true" className="label-caps flex items-center gap-2 text-[0.65rem]">
        {isTurn && <span className="size-1.5 rounded-full bg-ink" />}
        {t("table.scoreboard.self", { name })}
      </span>
      <span aria-hidden="true" className="flex items-end justify-between gap-3">
        <span className={cn("font-display font-semibold text-[4.25rem] leading-[0.85] tabular-nums lining-nums", entry.eliminated && "line-through")}>{entry.total}</span>
        <SuitGlyph suit="S" className="mb-1 size-9" />
      </span>
      <ThresholdBar value={entry.total} max={threshold} className="mt-2 [&>span]:bg-ink" />
    </li>
  );
}

function RivalRow({ entry, name, threshold, isTurn, srLabel }: ScoreRowProps) {
  const { t } = useTranslation();
  return (
    <li className="flex flex-col gap-1.5 border-b border-line py-3 last:border-b-0">
      <span className="sr-only">{srLabel}</span>
      <span aria-hidden="true" className="flex items-end justify-between gap-3">
        <span className="flex min-w-0 flex-col">
          <span className="label-caps flex items-center gap-2 text-[0.65rem] text-ink-soft">
            {isTurn && <span className="size-1.5 rounded-full bg-coral-ink" />}
            {entry.eliminated ? t("table.scoreboard.eliminated") : t("table.scoreboard.rival")}
          </span>
          <span className={cn("truncate text-xl", entry.eliminated && "text-ink-soft line-through")}>{name}</span>
        </span>
        <span className="font-display font-semibold text-[2.4rem] leading-none tabular-nums lining-nums">{entry.total}</span>
      </span>
      <ThresholdBar value={entry.total} max={threshold} />
    </li>
  );
}

export function Scoreboard({ entries, seats, threshold, selfId, turnPlayerId, bandClassName = "" }: ScoreboardProps) {
  const { t } = useTranslation();

  return (
    <ol className="flex flex-col">
      {entries.map((entry) => {
        const name = nicknameOf(seats, entry.playerId);
        const labelKey = entry.eliminated ? "table.scoreboard.entryLabelEliminated" : "table.scoreboard.entryLabel";
        const row = {
          entry,
          name,
          threshold,
          isTurn: entry.playerId === turnPlayerId,
          srLabel: t(labelKey, { name, points: entry.total, threshold }),
        };
        if (entry.playerId === selfId) return <SelfRow key={entry.playerId} {...row} bandClassName={bandClassName} />;
        return <RivalRow key={entry.playerId} {...row} />;
      })}
    </ol>
  );
}
