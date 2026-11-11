"use client";

import { useTranslation } from "react-i18next";

import type { ResultsView } from "../types";

export function ResultsHero({ results }: { results: ResultsView }) {
  const { t } = useTranslation();
  const winner = results.players.find((player) => player.id === results.winnerId);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="label-caps text-[0.7rem] text-coral-ink">
          {winner ? t("results.gameEyebrow") : t("results.roundEyebrow")} · {t(`gameMode.${results.mode}`)}
        </p>
        <h1 className="mt-3 font-display text-5xl leading-none sm:text-7xl">
          {winner ? t("results.gameTitle", { name: winner.name }) : t("results.roundTitle", { count: results.round })}
        </h1>
        <p className="mt-4 font-display text-xl text-ink-soft italic">{t("results.tagline")}</p>
      </div>
      <div aria-hidden="true" className="relative isolate h-56 overflow-hidden sm:h-72">
        <span className="absolute -bottom-24 left-1/2 -z-10 size-72 -translate-x-1/2 rounded-full bg-coral sm:size-96" />
        <span className="absolute inset-x-0 bottom-0 grid h-40 place-items-center rounded-t-[50%] bg-felt pt-6 text-paper sm:inset-x-8 sm:h-52">
          <span className="font-display text-6xl italic sm:text-8xl">{winner ? winner.name : results.round}</span>
        </span>
      </div>
    </div>
  );
}
