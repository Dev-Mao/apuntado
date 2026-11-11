"use client";

import { useState } from "react";

import { useTranslation } from "react-i18next";

import { Dialog } from "@/components";

import { SCOREBOARD_ID } from "./scoreboard";

const RULE_KEYS = [
  "table.rules.item1",
  "table.rules.item2",
  "table.rules.item3",
  "table.rules.item4",
  "table.rules.item5",
  "table.rules.item6",
] as const;
const LINK_CLASSES = "label-caps text-[0.65rem] underline-offset-4 hover:underline";

export function TableFooter({ threshold }: { threshold: number }) {
  const { t } = useTranslation();
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <>
      <nav aria-label={t("table.footer.label")} className="flex gap-6 border-t border-line pt-4">
        <button type="button" onClick={() => setRulesOpen(true)} className={LINK_CLASSES}>
          {t("table.footer.rules")}
        </button>
        <a href={`#${SCOREBOARD_ID}`} className={LINK_CLASSES}>
          {t("table.footer.scoreboard")}
        </a>
      </nav>
      <Dialog open={rulesOpen} title={t("table.rules.title")} closeLabel={t("common.close")} onClose={() => setRulesOpen(false)}>
        <ol className="mt-6 flex flex-col gap-4">
          {RULE_KEYS.map((key, index) => (
            <li key={key} className="flex gap-4">
              <span className="font-display text-3xl leading-none text-coral-deep italic">{index + 1}</span>
              <p className="leading-relaxed">{t(key, { threshold })}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 border-t border-line pt-4 font-display text-ink-soft italic">{t("table.rules.note")}</p>
      </Dialog>
    </>
  );
}
