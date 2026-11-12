"use client";

import { useTranslation } from "react-i18next";

import { MatchList } from "./match-list";
import { MemberPanels } from "./member-panels";

import type { ProfileView } from "@apuntado/contracts";

export function ProfileSheet({ profile }: { profile: ProfileView }) {
  const { t } = useTranslation();
  const stats = [
    { label: t("profile.stats.played"), value: profile.played },
    { label: t("profile.stats.won"), value: profile.won },
    { label: t("profile.stats.roundsWon"), value: profile.roundsWon },
    { label: t("profile.stats.apuntado"), value: profile.apuntadoClosures },
  ];

  return (
    <section aria-labelledby="sheet-title" className="flex min-h-0 animate-sheet-rise flex-col rounded-[1.75rem] bg-paper-light px-6 pt-5 pb-3 shadow-sheet sm:px-10 sm:pt-7">
      <h2 id="sheet-title" className="sr-only">
        {t("profile.sheetTitle")}
      </h2>
      <dl className="grid grid-cols-2 gap-x-6 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1.5 border-t border-line py-3">
            <dt className="label-caps text-[0.55rem] leading-relaxed text-ink-soft">{stat.label}</dt>
            <dd className="order-first font-display font-semibold text-[2.6rem] leading-none sm:text-[3.2rem] tabular-nums lining-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
      {profile.guest ? (
        <>
          <h3 className="label-caps mt-4 border-b-[1.5px] border-ink pb-2 text-[0.68rem] sm:mt-6">{t("profile.recentTitle")}</h3>
          <MatchList matches={profile.recent} />
        </>
      ) : (
        <MemberPanels matches={profile.recent} />
      )}
    </section>
  );
}
