"use client";

import { useState } from "react";

import { useTranslation } from "react-i18next";

import { AppHeader, RulesIcon } from "@/components";
import { SessionBadge, useRoomRedirect } from "@/features/realtime";
import { RulesDialog } from "@/features/table";
import { DEFAULT_TABLE_SETTINGS } from "@/lib";

import { CreateTableForm } from "./create-table-form";
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
    <div className="relative isolate overflow-x-clip">
      <span aria-hidden="true" className="absolute -top-44 -left-48 -z-10 size-[26rem] rounded-full bg-coral sm:-top-56 sm:-left-40 sm:size-[38rem]" />
      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col">
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
        <main className="grid flex-1 content-start gap-12 px-4 pt-6 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,31rem)] lg:gap-x-16 lg:gap-y-14 lg:pt-10">
          <HomeHero />
          <div className="flex flex-col gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <EntryNotice message={form.entryNotice} />
            <HomeEntry form={form} linkCode={linkCode} />
          </div>
          <CreateTableForm
            settings={form.settings}
            errors={form.errors}
            onModeChange={form.handleModeChange}
            onNumberChange={form.handleNumberChange}
            onSubmit={form.handleCreate}
          />
        </main>
        <RulesDialog open={rulesOpen} threshold={threshold} onClose={() => setRulesOpen(false)} />
      </div>
    </div>
  );
}
