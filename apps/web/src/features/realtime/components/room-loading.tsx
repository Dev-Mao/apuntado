"use client";

import { useTranslation } from "react-i18next";

import { AppHeader } from "@/components";

import { useRealtime } from "../context";
import { hasActiveRoom } from "../room-state";

export function RoomLoading() {
  const { t } = useTranslation();
  const { room } = useRealtime();
  return (
    <div className="mx-auto flex min-h-dvh max-w-[90rem] flex-col">
      <AppHeader homeLink={!hasActiveRoom(room)} />
      <main aria-busy="true" className="grid flex-1 place-items-center px-5 pb-10 sm:px-8">
        <p className="font-display text-2xl text-ink-soft italic">{t("realtime.loading")}</p>
      </main>
    </div>
  );
}
