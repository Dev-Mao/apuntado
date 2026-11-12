"use client";

import { useTranslation } from "react-i18next";

import { useRealtime } from "../context";

export function ConnectionBanner() {
  const { t } = useTranslation();
  const { session, connection } = useRealtime();
  const isLost = session.status === "offline" || (session.status === "ready" && connection === "reconnecting");

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3">
      {isLost && (
        <p className="label-caps flex items-center gap-2.5 rounded-full bg-ink px-4 pt-[0.6rem] pb-[0.5rem] text-[0.65rem] text-paper shadow-card">
          <span aria-hidden="true" className="size-2 shrink-0 animate-pulse rounded-full bg-coral" />
          {t("realtime.reconnecting")}
        </p>
      )}
    </div>
  );
}
