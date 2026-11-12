"use client";

import { useTranslation } from "react-i18next";

import { Scoreboard } from "./scoreboard";

import type { ScoreboardProps } from "./scoreboard";
import type { ClosureType, GameMode } from "@apuntado/contracts";
import type { ReactNode } from "react";

interface TableSidebarProps {
  round: number;
  mode: GameMode;
  code: string;
  enabledClosures: readonly ClosureType[];
  scoreboard: ScoreboardProps;
  turn: ReactNode;
  actions: ReactNode;
}

export function TableSidebar({ round, mode, code, enabledClosures, scoreboard, turn, actions }: TableSidebarProps) {
  const { t } = useTranslation();
  const facts = [
    { label: t("settings.mode"), value: t(`gameMode.${mode}`) },
    { label: t("table.closures"), value: enabledClosures.map((type) => t(`table.closureNames.${type}`)).join(", ") },
    { label: t("table.codeTag"), value: code },
  ];

  return (
    <aside
      aria-label={t("table.round", { count: round })}
      className="relative z-10 hidden min-h-0 flex-col gap-6 overflow-x-hidden overflow-y-auto border-l border-line bg-paper-light/75 px-7 py-7 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:flex"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="label-caps border-b-[1.5px] border-ink pb-2 text-[0.7rem]">{t("table.round", { count: round })}</p>
        <p className="text-sm text-ink-soft italic">{t("table.scoreboard.threshold", { count: scoreboard.threshold })}</p>
      </div>
      <Scoreboard {...scoreboard} bandClassName="-mx-7 px-7" />
      <span aria-hidden="true" className="h-px bg-line" />
      {turn}
      <dl className="flex flex-col">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-b-0">
            <dt className="label-caps text-[0.58rem] text-ink-soft">{fact.label}</dt>
            <dd className="text-right">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto pt-2">{actions}</div>
    </aside>
  );
}
