"use client";

import { useTranslation } from "react-i18next";

import { ThresholdBar } from "@/components";
import { cn } from "@/lib";

import { useCountUp } from "../hooks";
import { RESULT_STATUS } from "../types";

import type { ResultRow } from "../types";

const ROW_STAGGER_MS = 140;

interface ResultsRowProps {
  row: ResultRow;
  index: number;
  threshold: number;
  showPlace: boolean;
}

export function ResultsRow({ row, index, threshold, showPlace }: ResultsRowProps) {
  const { t } = useTranslation();
  const delay = 350 + index * ROW_STAGGER_MS;
  const total = useCountUp(row.total, delay);
  const roundPoints = useCountUp(row.roundPoints, delay);
  const isWinner = row.status === RESULT_STATUS.WINNER;
  const status = t(`results.status.${row.status}`);

  return (
    <tr className={cn("align-top", row.eliminated && "text-ink-soft")}>
      {showPlace && (
        <td className="relative w-0 py-3">
          <span className="absolute top-3 -left-9 w-6 text-center text-2xl leading-7 text-coral-ink italic">{index + 1}</span>
        </td>
      )}
      <th scope="row" className="py-3 pr-3 text-left font-normal">
        <span className={cn("block text-xl leading-7", row.eliminated && "line-through")}>{row.name}</span>
        <span className={cn("label-caps block text-[0.52rem] sm:hidden", isWinner ? "text-coral-ink" : "text-ink-soft")}>{status}</span>
      </th>
      <td className="py-3 text-right text-xl leading-7 text-ink-soft tabular-nums lining-nums">
        {t("results.roundPoints", { count: roundPoints })}
      </td>
      <td className="py-3 pl-4 sm:pl-6">
        <span className="flex flex-col items-end gap-1.5">
          <span className="font-display font-semibold text-[2.2rem] leading-7 tabular-nums lining-nums">{total}</span>
          <ThresholdBar value={row.total} max={threshold} className="w-16 sm:w-28" />
        </span>
      </td>
      <td className={cn("label-caps hidden py-3 pl-6 text-[0.55rem] leading-7 sm:table-cell", isWinner ? "text-coral-ink" : "text-ink-soft")}>{status}</td>
    </tr>
  );
}
