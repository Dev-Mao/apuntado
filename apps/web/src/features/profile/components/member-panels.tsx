"use client";

import { useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib";

import { MatchList } from "./match-list";
import { MovementList } from "./movement-list";

import type { ProfileMatch } from "@apuntado/contracts";
import type { KeyboardEvent } from "react";

const TABS = ["matches", "chips"] as const;

type Tab = (typeof TABS)[number];

export function MemberPanels({ matches }: { matches: readonly ProfileMatch[] }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("matches");
  const refs = useRef<Record<Tab, HTMLButtonElement | null>>({ matches: null, chips: null });

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const next: Tab = tab === "matches" ? "chips" : "matches";
    setTab(next);
    refs.current[next]?.focus();
  };

  return (
    <>
      <div role="tablist" aria-label={t("profile.tabs.label")} onKeyDown={handleKey} className="mt-4 flex gap-6 border-b-[1.5px] border-ink sm:mt-6">
        {TABS.map((name) => (
          <button
            key={name}
            ref={(node) => {
              refs.current[name] = node;
            }}
            id={`tab-${name}`}
            type="button"
            role="tab"
            aria-selected={tab === name}
            aria-controls="profile-panel"
            tabIndex={tab === name ? 0 : -1}
            onClick={() => setTab(name)}
            className={cn("label-caps min-h-11 pb-2 text-[0.68rem] transition-opacity", tab === name ? "-mb-[1.5px] border-b-[3px] border-coral-ink" : "opacity-55 hover:opacity-100")}
          >
            {t(`profile.tabs.${name}`)}
          </button>
        ))}
      </div>
      <div id="profile-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="flex flex-1 flex-col">
        {tab === "matches" ? <MatchList matches={matches} /> : <MovementList />}
      </div>
    </>
  );
}
