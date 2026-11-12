"use client";

import { useTranslation } from "react-i18next";

export function EntryNotice({ message }: { message: string | null }) {
  const { t } = useTranslation();
  if (!message) return null;
  return (
    <div role="alert" className="flex animate-turn-in gap-3 rounded-2xl border-[1.5px] border-coral-ink bg-paper-light p-4">
      <span aria-hidden="true" className="mt-1.5 size-2.5 shrink-0 rounded-full bg-coral-ink" />
      <div>
        <p className="label-caps text-[0.65rem] text-coral-ink">{t("home.entryFailed")}</p>
        <p className="mt-1 text-lg">{message}</p>
      </div>
    </div>
  );
}
