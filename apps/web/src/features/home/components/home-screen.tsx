"use client";

import { useState } from "react";

import { useTranslation } from "react-i18next";

import { AppHeader, RulesIcon } from "@/components";
import { AccountMenu, useFreshWallet } from "@/features/account";
import { useRoomRedirect } from "@/features/realtime";
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
  useFreshWallet();

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
            <AccountMenu />
          </nav>
        </AppHeader>
        <main className="grid min-h-0 w-full flex-1 gap-5 overflow-y-auto overscroll-contain px-4 pt-1 pb-4 [align-content:safe_center] short:gap-3 sm:px-8 max-lg:mx-auto max-lg:max-w-xl md:short:max-w-4xl md:short:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:short:gap-10 md:short:[align-items:safe_center] lg:max-w-none lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16 lg:[align-items:safe_center]">
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
