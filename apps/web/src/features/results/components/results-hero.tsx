"use client";

import { useTranslation } from "react-i18next";

import type { ResultsSummary } from "../types";

export function ResultsHero({ summary }: { summary: ResultsSummary }) {
  const { t } = useTranslation();
  const stage = summary.isFinished ? t("results.gameEyebrow") : t("results.roundEyebrow");
  const closure =
    summary.closureType && summary.roundWinnerName
      ? t("results.closedBy", { name: summary.roundWinnerName, closure: t(`closureType.${summary.closureType}`) })
      : t("results.noClosure");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="label-caps text-[0.7rem] text-coral-ink">
          {t("results.eyebrow", { stage, mode: t(`gameMode.${summary.mode}`) })}
        </p>
        <h1 className="mt-3 font-display text-5xl leading-none sm:text-7xl">
          {summary.winnerName
            ? t("results.gameTitle", { name: summary.winnerName })
            : t("results.roundTitle", { count: summary.roundNumber })}
        </h1>
        <p className="mt-4 font-display text-xl text-ink-soft italic">{t("results.tagline")}</p>
        <p className="label-caps mt-5 inline-flex rounded-full border border-ink/50 px-3 pt-[0.45rem] pb-[0.35rem] text-[0.65rem]">
          {closure}
        </p>
      </div>
      <div aria-hidden="true" className="relative isolate h-56 overflow-hidden sm:h-72">
        <span className="absolute -bottom-24 left-1/2 -z-10 size-72 -translate-x-1/2 rounded-full bg-coral sm:size-96" />
        <span className="absolute inset-x-0 bottom-0 grid h-40 place-items-center rounded-t-[50%] bg-felt pt-6 text-paper sm:inset-x-8 sm:h-52">
          <span className="font-display text-6xl italic sm:text-8xl">{summary.winnerName ?? summary.roundNumber}</span>
        </span>
      </div>
    </div>
  );
}
