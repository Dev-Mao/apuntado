"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib";

import { useMatchFormat } from "../hooks";

import type { ProfileMatch } from "@apuntado/contracts";

export function MatchItem({ match }: { match: ProfileMatch }) {
  const { t } = useTranslation();
  const format = useMatchFormat();

  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 py-3">
      <p className="flex min-w-0 flex-wrap items-baseline gap-x-2">
        <span className={cn("text-xl italic", match.won ? "text-coral-ink" : "text-ink")}>
          {match.won ? t("profile.match.won") : t("profile.match.lost")}
        </span>
        <span className="text-ink-soft">{format.rivals(match.rivals)}</span>
      </p>
      <p className="row-span-2 self-center text-right">
        <span className="block text-[2rem] leading-none tabular-nums">{match.points}</span>
        <span className="label-caps text-[0.5rem] text-ink-soft">{t("profile.match.pointsUnit", { count: match.points })}</span>
      </p>
      <p className="label-caps text-[0.55rem] leading-relaxed text-ink-soft">
        <time dateTime={match.finishedAt}>{format.date(match.finishedAt)}</time>
        {", "}
        {t(`gameMode.${match.mode}`)}
        {", "}
        {t("profile.match.rounds", { count: match.rounds })}
      </p>
    </li>
  );
}
