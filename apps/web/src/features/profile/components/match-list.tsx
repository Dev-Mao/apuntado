"use client";

import Link from "next/link";

import { useTranslation } from "react-i18next";

import { buttonClasses, BUTTON_VARIANT } from "@/components";
import { ROUTES } from "@/lib";

import { MatchItem } from "./match-item";

import type { ProfileMatch } from "@apuntado/contracts";

function EmptyHistory() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-0 flex-col items-start gap-3 overflow-y-auto py-4">
      <p className="text-2xl italic">{t("profile.empty.title")}</p>
      <p className="max-w-md text-ink-soft">{t("profile.empty.body")}</p>
      <Link href={ROUTES.HOME} className={buttonClasses(BUTTON_VARIANT.DARK, "mt-1")}>
        {t("profile.empty.action")}
      </Link>
    </div>
  );
}

export function MatchList({ matches }: { matches: readonly ProfileMatch[] }) {
  if (matches.length === 0) return <EmptyHistory />;
  return (
    <ol className="min-h-[12rem] divide-y divide-line overflow-y-auto overscroll-contain [mask-image:linear-gradient(to_bottom,black_calc(100%-1.25rem),transparent)]">
      {matches.map((match) => (
        <MatchItem key={match.matchId} match={match} />
      ))}
    </ol>
  );
}
