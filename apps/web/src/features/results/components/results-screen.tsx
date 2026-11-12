"use client";

import { useTranslation } from "react-i18next";

import { AppHeader, Button } from "@/components";

import { useResultsSummary } from "../hooks";
import { ResultsHero } from "./results-hero";
import { ResultsTable } from "./results-table";

import type { ResultsScreenProps } from "../types";

export function ResultsScreen({ snapshot, onLeave }: ResultsScreenProps) {
  const { t } = useTranslation();
  const summary = useResultsSummary(snapshot);
  const eliminated = summary.rows.filter((row) => row.eliminated);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[90rem] flex-col">
      <AppHeader homeLink={summary.isFinished} />
      <main className="grid flex-1 gap-10 px-5 pb-10 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <ResultsHero summary={summary} />
        <div className="flex flex-col gap-8 lg:pt-4">
          <ResultsTable summary={summary} />
          <p className="font-display text-ink-soft italic">
            {t("results.threshold", { count: summary.threshold })}
          </p>
          <section aria-labelledby="eliminated-title" className="flex flex-col gap-3">
            <h2 id="eliminated-title" className="label-caps border-b border-ink pb-2 text-xs">
              {t("results.eliminatedTitle")}
            </h2>
            {eliminated.length === 0 ? (
              <p className="font-display italic">{t("results.noEliminated")}</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {eliminated.map((row) => (
                  <li key={row.playerId} className="label-caps rounded-full border border-ink/50 px-3 pt-[0.45rem] pb-[0.35rem] text-[0.65rem]">
                    {row.name}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <div className="flex flex-col gap-3 border-t border-line pt-6">
            {summary.isFinished ? (
              <Button onClick={onLeave} className="sm:self-start">
                {t("results.backHome")}
              </Button>
            ) : (
              <p role="status" className="font-display text-lg italic">
                {t("results.nextRoundSoon")}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
