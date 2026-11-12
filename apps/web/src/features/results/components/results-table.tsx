"use client";

import { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib";

import { rankRows } from "../ranking";
import { ResultsRow } from "./results-row";

import type { ResultsSummary } from "../types";

const HEADER_CLASSES = "label-caps pb-3 text-left text-[0.55rem] font-semibold text-ink-soft";

export function ResultsTable({ summary }: { summary: ResultsSummary }) {
  const { t } = useTranslation();
  const rows = useMemo(() => (summary.isFinished ? rankRows(summary.rows) : summary.rows), [summary]);

  return (
    <table className="w-full border-collapse">
      <caption className="sr-only">{t("results.caption", { count: summary.roundNumber })}</caption>
      <thead className="border-b-[1.5px] border-ink">
        <tr>
          {summary.isFinished && (
            <th scope="col" className="w-0 p-0">
              <span className="sr-only">{t("results.columns.place")}</span>
            </th>
          )}
          <th scope="col" className={HEADER_CLASSES}>
            {t("results.columns.player")}
          </th>
          <th scope="col" className={cn(HEADER_CLASSES, "text-right")}>
            {t("results.columns.round")}
          </th>
          <th scope="col" className={cn(HEADER_CLASSES, "pl-4 text-right sm:pl-6")}>
            {t("results.columns.total")}
          </th>
          <th scope="col" className={cn(HEADER_CLASSES, "hidden pl-6 sm:table-cell")}>
            {t("results.columns.status")}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map((row, index) => (
          <ResultsRow key={row.playerId} row={row} index={index} threshold={summary.threshold} showPlace={summary.isFinished} />
        ))}
      </tbody>
    </table>
  );
}
