"use client";

import { useTranslation } from "react-i18next";

import { BarsIcon, RulesIcon } from "@/components";

interface TableLinksProps {
  onShowRules: () => void;
  onShowScores: () => void;
}

const LINK_CLASSES = "label-caps flex items-center gap-2.5 py-2 text-[0.65rem] transition-colors hover:text-coral-ink";

export function TableLinks({ onShowRules, onShowScores }: TableLinksProps) {
  const { t } = useTranslation();

  return (
    <nav aria-label={t("table.footer.label")} className="hidden items-center gap-5 lg:flex">
      <button type="button" onClick={onShowRules} className={LINK_CLASSES}>
        <RulesIcon className="size-5" />
        {t("table.footer.rules")}
      </button>
      <span aria-hidden="true" className="h-5 w-px bg-ink/30" />
      <button type="button" onClick={onShowScores} className={LINK_CLASSES}>
        <BarsIcon className="size-5" />
        {t("table.footer.scoreboard")}
      </button>
    </nav>
  );
}
