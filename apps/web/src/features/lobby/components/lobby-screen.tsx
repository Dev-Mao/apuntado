"use client";

import { useTranslation } from "react-i18next";

import { AppHeader, ArrowIcon, Button, BUTTON_VARIANT, LiveNotice } from "@/components";
import { ChipBalance } from "@/features/account";

import { LobbyTable } from "./lobby-table";
import { SettingsSummary } from "./settings-summary";

import type { LobbyScreenProps } from "../types";

export function LobbyScreen({ lobby, selfId, notice, onAddBot, onStart, onLeave }: LobbyScreenProps) {
  const { t } = useTranslation();
  const isHost = lobby.hostId === selfId;
  const stake = lobby.settings.stake;

  return (
    <div className="relative isolate h-dvh overflow-hidden">
      <span aria-hidden="true" className="absolute -top-32 -right-36 -z-10 size-80 rounded-full bg-coral sm:-top-48 sm:-right-40 sm:size-[30rem]" />
      <div className="mx-auto flex h-full max-w-5xl flex-col">
        <AppHeader homeLink={false}>
          <div className="flex items-center gap-3">
            <ChipBalance className="max-sm:hidden" />
            <Button variant={BUTTON_VARIANT.GHOST} onClick={onLeave} className="px-2">
              {t("lobby.leave")}
            </Button>
          </div>
        </AppHeader>
        <main className="flex min-h-0 flex-1 flex-col gap-5 px-4 pb-5 short:gap-3 short:pb-3 sm:px-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[clamp(2.6rem,9vw,4.6rem)] leading-[0.9] font-semibold tracking-[-0.02em] short:text-[2.2rem]">{t("lobby.heading")}</h1>
            <p className="text-lg italic short:hidden sm:text-xl">
              {t("lobby.tagline")} <span className="text-coral-ink">{t("lobby.playersCount", { count: lobby.seats.length, max: lobby.maxSeats })}</span>
            </p>
            {stake > 0 && (
              <p className="label-caps flex w-fit items-center gap-2.5 rounded-full bg-ink px-4 pt-[0.55rem] pb-[0.45rem] text-[0.68rem] text-paper">
                <span aria-hidden="true" className="size-3 rounded-full border-[1.5px] border-paper bg-coral" />
                {t("lobby.stakeBadge", { chips: t("common.chips", { count: stake }) })}
              </p>
            )}
          </div>
          <LobbyTable lobby={lobby} selfId={selfId} />
          <div className="flex flex-col items-center gap-3">
            {isHost ? (
              <div className="flex w-full flex-col gap-2 tiny:flex-row tiny:justify-center sm:w-auto sm:flex-row">
                <Button onClick={onStart} className="sm:min-w-56">
                  {t("lobby.start")}
                  <ArrowIcon />
                </Button>
                <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onAddBot} disabled={stake > 0} aria-describedby={stake > 0 ? "bot-reason" : undefined}>
                  {t("lobby.addBot")}
                </Button>
              </div>
            ) : (
              <p className="text-lg italic short:hidden sm:text-xl">{t("lobby.waitingHost")}</p>
            )}
            {isHost && stake > 0 && (
              <p id="bot-reason" className="text-center text-base text-ink-soft italic">
                {t("lobby.botDisabled")}
              </p>
            )}
            <LiveNotice message={notice} className="text-center" />
          </div>
          <SettingsSummary settings={lobby.settings} />
        </main>
      </div>
    </div>
  );
}
