"use client";

import { useTranslation } from "react-i18next";

import { ThresholdBar } from "@/components";
import { cn } from "@/lib";

import type { PlayerResult, ResultsView } from "../types";

const HEADER_CLASSES = "label-caps pb-3 text-left text-[0.62rem] font-semibold text-ink-soft";

function statusKey(player: PlayerResult, winnerId: string | null) {
  if (player.id === winnerId) return "results.status.winner" as const;
  if (player.isEliminated) return "results.status.eliminated" as const;
  if (player.closedRound) return "results.status.closed" as const;
  return "results.status.playing" as const;
}

export function ResultsTable({ results }: { results: ResultsView }) {
  const { t } = useTranslation();

  return (
    <table className="w-full border-collapse">
      <caption className="sr-only">{t("results.caption", { count: results.round })}</caption>
      <thead className="border-b border-ink">
        <tr>
          <th scope="col" className={HEADER_CLASSES}>
            {t("results.columns.player")}
          </th>
          <th scope="col" className={cn(HEADER_CLASSES, "text-right")}>
            {t("results.columns.round")}
          </th>
          <th scope="col" className={cn(HEADER_CLASSES, "pl-4 text-right sm:pl-8")}>
            {t("results.columns.total")}
          </th>
          <th scope="col" className={cn(HEADER_CLASSES, "hidden pl-8 sm:table-cell")}>
            {t("results.columns.status")}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {results.players.map((player) => {
          const isWinner = player.id === results.winnerId;
          const status = t(statusKey(player, results.winnerId));
          return (
            <tr key={player.id} className={cn(player.isEliminated && "text-ink-soft")}>
              <th scope="row" className="py-4 text-left font-normal">
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", isWinner ? "bg-coral" : "bg-ink/20")} />
                  <span className={cn("font-display text-xl sm:text-2xl", player.isEliminated && "line-through")}>{player.name}</span>
                </span>
                <span className="label-caps mt-1 ml-5.5 block text-[0.58rem] text-ink-soft sm:hidden">{status}</span>
              </th>
              <td className="py-4 text-right font-display text-xl tabular-nums sm:text-2xl">+{player.roundPoints}</td>
              <td className="py-4 pl-4 sm:pl-8">
                <span className="flex flex-col items-end gap-2">
                  <span className="font-display text-3xl leading-none tabular-nums sm:text-4xl">{player.totalPoints}</span>
                  <ThresholdBar value={player.totalPoints} max={results.eliminationThreshold} className="w-20 sm:w-32" />
                </span>
              </td>
              <td className={cn("hidden py-4 pl-8 sm:table-cell", isWinner && "text-coral-deep")}>
                <span className="label-caps text-[0.65rem]">{status}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
