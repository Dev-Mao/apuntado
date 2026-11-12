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
        <div className="flex flex-col items-center gap-5">
          <span aria-hidden="true" className="flex">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="card-back -ml-3 block aspect-[5/7] w-9 animate-pulse rounded-md shadow-card first:ml-0"
                style={{ rotate: `${(index - 1) * 12}deg`, animationDelay: `${index * 160}ms` }}
              />
            ))}
          </span>
          <p className="text-2xl text-ink-soft italic">{t("realtime.loading")}</p>
        </div>
      </main>
    </div>
  );
}
