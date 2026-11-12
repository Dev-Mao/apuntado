"use client";

import { useTranslation } from "react-i18next";

import { RulesIcon, SuitGlyph } from "@/components";

import { TableLinks } from "./table-links";

interface TableHeaderProps {
  code: string;
  round: number;
  onShowRules: () => void;
  onShowScores: () => void;
}

export function TableHeader({ code, round, onShowRules, onShowScores }: TableHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 short:py-1.5 sm:px-8 lg:col-start-1">
      <h1 className="sr-only">{t("table.title", { code })}</h1>
      <div className="flex items-center gap-3">
        <SuitGlyph suit="S" className="size-6 sm:size-7" />
        <span className="label-caps text-[0.75rem] tracking-[0.3em]">{t("brand.name")}</span>
        <span aria-hidden="true" className="hidden h-px w-14 bg-ink/40 sm:block" />
      </div>
      <TableLinks onShowRules={onShowRules} onShowScores={onShowScores} />
      <div className="flex items-center gap-4 lg:hidden">
        <span className="label-caps text-[0.62rem] lg:hidden">{t("table.round", { count: round })}</span>
        <button
          type="button"
          onClick={onShowRules}
          className="label-caps flex items-center gap-2 rounded-full py-2 text-[0.62rem] transition-colors hover:text-coral-ink"
        >
          <RulesIcon className="size-5" />
          <span className="max-sm:sr-only">{t("table.footer.rules")}</span>
        </button>
      </div>
    </header>
  );
}
