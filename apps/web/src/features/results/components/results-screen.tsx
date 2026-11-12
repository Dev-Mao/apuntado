"use client";

import Link from "next/link";

import { useTranslation } from "react-i18next";

import { AppHeader, Button, buttonClasses, BUTTON_VARIANT } from "@/components";
import { cn, profileHref } from "@/lib";

import { useResultsSummary } from "../hooks";
import { ResultsHero } from "./results-hero";
import { ResultsTable } from "./results-table";

import type { ResultsScreenProps } from "../types";

export function ResultsScreen({ snapshot, onLeave }: ResultsScreenProps) {
  const { t } = useTranslation();
  const summary = useResultsSummary(snapshot);
  const isSelfWinner = snapshot.view.winnerId !== null && snapshot.view.winnerId === snapshot.view.playerId;

  return (
    <div className="relative isolate overflow-x-clip">
      <span
        aria-hidden="true"
        className={cn(
          "absolute -z-10 rounded-full bg-coral",
          summary.isFinished ? "-top-56 left-1/2 size-[36rem] -translate-x-1/2" : "-top-32 -right-32 size-80 sm:size-[26rem]",
        )}
      />
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col">
        <AppHeader homeLink={summary.isFinished} />
        <main className="flex flex-1 flex-col gap-8 px-4 pt-2 pb-12 sm:px-8">
          <ResultsHero summary={summary} isSelfWinner={isSelfWinner} />
          <section aria-labelledby="sheet-title" className="animate-sheet-rise rounded-[1.75rem] bg-paper-light py-6 pr-5 pl-12 shadow-sheet [animation-delay:200ms] sm:py-8 sm:pr-9 sm:pl-16">
            <h2 id="sheet-title" className="label-caps text-[0.68rem]">
              {summary.isFinished ? t("results.finalSheet") : t("results.roundSheet", { count: summary.roundNumber })}
            </h2>
            <p className="mt-1 mb-4 text-ink-soft italic">{t("results.threshold", { count: summary.threshold })}</p>
            <ResultsTable summary={summary} />
          </section>
          {summary.isFinished ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={onLeave}>{t("results.backHome")}</Button>
              <Link href={profileHref()} className={buttonClasses(BUTTON_VARIANT.OUTLINE)}>
                {t("results.profile")}
              </Link>
            </div>
          ) : (
            <p role="status" className="flex items-center justify-center gap-2 text-xl italic">
              <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-coral" />
              {t("results.nextRoundSoon")}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
