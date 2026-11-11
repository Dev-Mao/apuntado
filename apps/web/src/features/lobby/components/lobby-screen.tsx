"use client";

import { useTranslation } from "react-i18next";

import { AppHeader, Button, BUTTON_VARIANT } from "@/components";

import { PlayerList } from "./player-list";
import { SettingsSummary } from "./settings-summary";
import { ShareCode } from "./share-code";

import type { LobbyScreenProps } from "../types";

export function LobbyScreen({ lobby, onStart, onLeave }: LobbyScreenProps) {
  const { t } = useTranslation();
  const isHost = lobby.players.some((player) => player.id === lobby.selfId && player.isHost);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[90rem] flex-col">
      <AppHeader />
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
          <PlayerList players={lobby.players} selfId={lobby.selfId} maxPlayers={lobby.maxPlayers} />
          <SettingsSummary settings={lobby.settings} />
          <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
            {isHost ? (
              <Button onClick={onStart} disabled={!lobby.canStart}>
                {t("lobby.start")}
              </Button>
            ) : (
              <p className="font-display text-lg italic">{t("lobby.waitingHost")}</p>
            )}
            <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onLeave}>
              {t("lobby.leave")}
            </Button>
            {isHost && !lobby.canStart && (
              <p className="font-display text-sm text-ink-soft italic">{t("lobby.waitingPlayers")}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
