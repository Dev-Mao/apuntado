"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";

import { useTranslation } from "react-i18next";

import { ROUTES } from "@/lib";

import { useRealtime } from "../context";

export function RoomNotice() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { entryNotice, setEntryNotice } = useRealtime();
  const handleDismiss = useCallback(() => setEntryNotice(null), [setEntryNotice]);
  const visible = entryNotice !== null && pathname !== ROUTES.HOME;

  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      {visible && (
        <div className="flex max-w-xl items-start gap-3 rounded-2xl border-[1.5px] border-coral-deep bg-paper p-4 shadow-card">
          <span aria-hidden="true" className="mt-1 size-2.5 shrink-0 rounded-full bg-coral-deep" />
          <div className="flex-1">
            <p className="label-caps text-[0.65rem] text-coral-ink">{t("home.entryFailed")}</p>
            <p className="mt-1 font-display text-lg">{entryNotice}</p>
          </div>
          <button type="button" onClick={handleDismiss} className="label-caps rounded-full border border-ink px-3 py-1.5 text-[0.6rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            {t("common.close")}
          </button>
        </div>
      )}
    </div>
  );
}
