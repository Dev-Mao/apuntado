"use client";

import { useTranslation } from "react-i18next";

import { ExitIcon, RulesIcon, SoundControls, SuitGlyph } from "@/components";

import { TableLinks } from "./table-links";

interface TableHeaderProps {
  code: string;
  round: number;
  onShowRules: () => void;
  onShowScores: () => void;
  onAbandon: () => void;
}

export function TableHeader({ code, round, onShowRules, onShowScores, onAbandon }: TableHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 short:py-1.5 sm:px-8 lg:col-start-1">
      <h1 className="sr-only">{t("table.title", { code })}</h1>
      <div className="flex items-center gap-3">
        <SuitGlyph suit="S" className="size-6 sm:size-7" />
        <span className="font-display text-[1.3rem] leading-none whitespace-nowrap max-[26rem]:sr-only">{t("brand.name")}</span>
      </div>
      <TableLinks onShowRules={onShowRules} onShowScores={onShowScores} onAbandon={onAbandon} />
      <div className="flex items-center gap-2 sm:gap-4">
        <SoundControls />
        <span className="label-caps text-[0.65rem] lg:hidden">{t("table.round", { count: round })}</span>
        <button
          type="button"
          onClick={onShowRules}
          className="label-caps flex lg:hidden min-h-11 min-w-11 items-center justify-center gap-2 rounded-full py-2 text-[0.65rem] transition-colors hover:text-coral-ink"
        >
          <RulesIcon className="size-5" />
          <span className="max-sm:sr-only">{t("table.footer.rules")}</span>
        </button>
        <button
          type="button"
          onClick={onAbandon}
          className="label-caps flex lg:hidden min-h-11 min-w-11 items-center justify-center gap-2 rounded-full py-2 text-[0.65rem] transition-colors hover:text-coral-ink"
        >
          <ExitIcon className="size-5" />
          <span className="max-sm:sr-only">{t("table.abandon.action")}</span>
        </button>
      </div>
    </header>
  );
}
