"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib";

import { useRealtime } from "../context";

export function ConnectionBanner() {
  const { t } = useTranslation();
  const { session, connection } = useRealtime();
  const isLost = session.status === "offline" || (session.status === "ready" && connection === "reconnecting");
  const isFailed = session.status === "ready" && connection === "failed";

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3">
      {(isLost || isFailed) && (
        <p className="label-caps flex items-center gap-2.5 rounded-full bg-ink px-4 pt-[0.6rem] pb-[0.5rem] text-[0.65rem] text-paper shadow-card">
          <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full bg-coral", isLost && "animate-pulse")} />
          {t(isFailed ? "realtime.rejected" : "realtime.reconnecting")}
        </p>
      )}
    </div>
  );
}
