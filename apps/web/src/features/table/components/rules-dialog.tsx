"use client";

import { useTranslation } from "react-i18next";

import { Dialog } from "@/components";

const RULE_KEYS = [
  "table.rules.item1",
  "table.rules.item2",
  "table.rules.item3",
  "table.rules.item4",
  "table.rules.item5",
  "table.rules.item6",
] as const;

interface RulesDialogProps {
  open: boolean;
  threshold: number;
  onClose: () => void;
}

export function RulesDialog({ open, threshold, onClose }: RulesDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} title={t("table.rules.title")} closeLabel={t("common.close")} onClose={onClose}>
      <ol className="mt-6 flex flex-col">
        {RULE_KEYS.map((key, index) => (
          <li key={key} className="flex gap-5 border-t border-line py-4">
            <span aria-hidden="true" className="w-6 shrink-0 text-3xl leading-none text-coral-ink italic">
              {index + 1}
            </span>
            <p className="leading-relaxed">{t(key, { threshold })}</p>
          </li>
        ))}
      </ol>
      <p className="border-t border-line pt-4 text-ink-soft italic">{t("table.rules.note")}</p>
    </Dialog>
  );
}
