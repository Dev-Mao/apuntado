"use client";

import { useTranslation } from "react-i18next";

import { AppHeader, Button, BUTTON_VARIANT, LiveNotice } from "@/components";

import { PlayerList } from "./player-list";
import { SettingsSummary } from "./settings-summary";
import { ShareCode } from "./share-code";

import type { LobbyScreenProps } from "../types";

export function LobbyScreen({ lobby, selfId, notice, onAddBot, onStart, onLeave }: LobbyScreenProps) {
  const { t } = useTranslation();
  const isHost = lobby.hostId === selfId;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[90rem] flex-col">
      <AppHeader homeLink={false} />
      <main className="grid flex-1 gap-10 px-5 pb-10 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-8">
          <div>
            <p className="label-caps text-[0.7rem] text-coral-ink">{t("lobby.eyebrow")}</p>
            <h1 className="mt-3 font-display text-5xl leading-none sm:text-7xl">{t("lobby.title", { code: lobby.code })}</h1>
            <p className="mt-4 font-display text-xl text-ink-soft italic">{t("lobby.tagline")}</p>
          </div>
          <ShareCode code={lobby.code} />
        </div>
        <div className="flex flex-col gap-10 lg:pt-4">
          <PlayerList seats={lobby.seats} hostId={lobby.hostId} selfId={selfId} maxPlayers={lobby.maxSeats} />
          <SettingsSummary settings={lobby.settings} />
          <div className="flex flex-col gap-4 border-t border-line pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {isHost ? (
                <>
                  <Button onClick={onStart}>{t("lobby.start")}</Button>
                  <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onAddBot}>
                    {t("lobby.addBot")}
                  </Button>
                </>
              ) : (
                <p className="font-display text-lg italic">{t("lobby.waitingHost")}</p>
              )}
              <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onLeave}>
                {t("lobby.leave")}
              </Button>
            </div>
            <LiveNotice message={notice} />
          </div>
        </div>
      </main>
    </div>
  );
}
