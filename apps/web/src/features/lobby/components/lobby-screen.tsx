"use client";

import { useTranslation } from "react-i18next";

import { AppHeader, ArrowIcon, Button, BUTTON_VARIANT, LiveNotice } from "@/components";

import { LobbyTable } from "./lobby-table";
import { SettingsSummary } from "./settings-summary";

import type { LobbyScreenProps } from "../types";

export function LobbyScreen({ lobby, selfId, notice, onAddBot, onStart, onLeave }: LobbyScreenProps) {
  const { t } = useTranslation();
  const isHost = lobby.hostId === selfId;

  return (
    <div className="relative isolate overflow-x-clip">
      <span aria-hidden="true" className="absolute -top-32 -right-36 -z-10 size-80 rounded-full bg-coral sm:-top-48 sm:-right-40 sm:size-[30rem]" />
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col">
        <AppHeader homeLink={false}>
          <Button variant={BUTTON_VARIANT.GHOST} onClick={onLeave} className="px-2">
            {t("lobby.leave")}
          </Button>
        </AppHeader>
        <main className="flex flex-1 flex-col gap-8 px-4 pb-12 sm:px-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-[clamp(3rem,10vw,5.5rem)] leading-[0.9] tracking-[-0.02em]">{t("lobby.heading")}</h1>
            <p className="text-xl italic">
              {t("lobby.tagline")} <span className="text-coral-ink">{t("lobby.playersCount", { count: lobby.seats.length, max: lobby.maxSeats })}</span>
            </p>
          </div>
          <LobbyTable lobby={lobby} selfId={selfId} />
          <div className="flex flex-col items-center gap-3">
            {isHost ? (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button onClick={onStart} className="sm:min-w-56">
                  {t("lobby.start")}
                  <ArrowIcon />
                </Button>
                <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onAddBot}>
                  {t("lobby.addBot")}
                </Button>
              </div>
            ) : (
              <p className="text-xl italic">{t("lobby.waitingHost")}</p>
            )}
            <LiveNotice message={notice} className="text-center" />
          </div>
          <SettingsSummary settings={lobby.settings} />
        </main>
      </div>
    </div>
  );
}
