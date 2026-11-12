"use client";

import { useState } from "react";

import { useTranslation } from "react-i18next";

import { AppHeader, RulesIcon } from "@/components";
import { SessionBadge, useRoomRedirect } from "@/features/realtime";
import { RulesDialog } from "@/features/table";
import { DEFAULT_TABLE_SETTINGS } from "@/lib";

import { EntryNotice } from "./entry-notice";
import { HomeEntry } from "./home-entry";
import { HomeHero } from "./home-hero";
import { useHomeForm } from "../hooks";

interface HomeScreenProps {
  linkCode: string | null;
}

export function HomeScreen({ linkCode }: HomeScreenProps) {
  const { t } = useTranslation();
  const form = useHomeForm(linkCode);
  const [rulesOpen, setRulesOpen] = useState(false);
  const threshold = Number(form.settings.eliminationThreshold) || DEFAULT_TABLE_SETTINGS.eliminationThreshold;
  useRoomRedirect(null);

  return (
    <div className="relative isolate h-dvh overflow-hidden">
      <span aria-hidden="true" className="absolute -top-44 -left-48 -z-10 size-[26rem] rounded-full bg-coral sm:-top-56 sm:-left-40 sm:size-[38rem]" />
      <div className="mx-auto flex h-full max-w-6xl flex-col">
        <AppHeader>
          <nav aria-label={t("home.nav")} className="flex items-center gap-2 sm:gap-6">
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="label-caps flex items-center gap-2 rounded-full py-2 text-[0.62rem] transition-colors hover:text-coral-ink"
            >
              <RulesIcon className="size-5" />
              <span className="max-sm:sr-only">{t("home.rules")}</span>
            </button>
            <SessionBadge />
          </nav>
        </AppHeader>
        <main className="grid min-h-0 flex-1 content-center gap-6 overflow-y-auto overscroll-contain px-4 pb-6 short:gap-3 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-center lg:gap-16">
          <HomeHero />
          <div className="flex flex-col gap-4">
            <EntryNotice message={form.entryNotice} />
            <HomeEntry form={form} linkCode={linkCode} />
          </div>
        </main>
        <RulesDialog open={rulesOpen} threshold={threshold} onClose={() => setRulesOpen(false)} />
      </div>
    </div>
  );
}
