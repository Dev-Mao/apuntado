"use client";

import { useTranslation } from "react-i18next";

import { AppHeader, BUTTON_VARIANT, ButtonLink } from "@/components";
import { ROUTES } from "@/lib";

import { ResultsHero } from "./results-hero";
import { ResultsTable } from "./results-table";

import type { ResultsView } from "../types";

export function ResultsScreen({ results }: { results: ResultsView }) {
  const { t } = useTranslation();
  const isGameOver = results.winnerId !== null;
  const eliminated = results.players.filter((player) => player.isEliminated);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[90rem] flex-col">
      <AppHeader />
      <main className="grid flex-1 gap-10 px-5 pb-10 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <ResultsHero results={results} />
        <div className="flex flex-col gap-8 lg:pt-4">
          <ResultsTable results={results} />
          <p className="font-display text-ink-soft italic">
            {t("results.threshold", { count: results.eliminationThreshold })}
          </p>
          <section aria-labelledby="eliminated-title" className="flex flex-col gap-3">
            <h2 id="eliminated-title" className="label-caps border-b border-ink pb-2 text-xs">
              {t("results.eliminatedTitle")}
            </h2>
            {eliminated.length === 0 ? (
              <p className="font-display italic">{t("results.noEliminated")}</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {eliminated.map((player) => (
                  <li key={player.id} className="label-caps rounded-full border border-ink/50 px-3 pt-[0.45rem] pb-[0.35rem] text-[0.65rem]">
                    {player.name}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
            {isGameOver ? (
              <ButtonLink href={ROUTES.LOBBY}>{t("results.newGame")}</ButtonLink>
            ) : (
              <ButtonLink href={ROUTES.TABLE}>{t("results.nextRound")}</ButtonLink>
            )}
            <ButtonLink href={ROUTES.HOME} variant={BUTTON_VARIANT.OUTLINE}>
              {t("results.backHome")}
            </ButtonLink>
          </div>
        </div>
      </main>
    </div>
  );
}
