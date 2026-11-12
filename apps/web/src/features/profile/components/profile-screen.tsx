"use client";

import { useTranslation } from "react-i18next";

import { AppHeader } from "@/components";
import { AccountMenu, ChipBalance } from "@/features/account";

import { useProfile } from "../hooks";
import { GuestInvite } from "./guest-invite";
import { ProfileMessage } from "./profile-message";
import { ProfileSheet } from "./profile-sheet";

import type { ProfileView } from "@apuntado/contracts";

function ProfileIdentity({ profile }: { profile: ProfileView }) {
  const { t } = useTranslation();
  return (
    <div className="flex shrink-0 items-center gap-4">
      <span
        aria-hidden="true"
        className="grid size-16 shrink-0 place-items-center rounded-full border-[1.5px] border-ink bg-coral text-3xl italic shadow-card"
      >
        {profile.nickname.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0">
        <h1 className="truncate font-display font-semibold text-[clamp(2.6rem,9vw,4.5rem)] leading-[1.15] tracking-[-0.02em]">{profile.nickname}</h1>
        <p className="label-caps mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.65rem] text-ink-soft">
          {profile.guest ? t("profile.guest") : t("profile.member")}
          <ChipBalance className="text-ink" />
        </p>
      </div>
    </div>
  );
}

export function ProfileScreen() {
  const { t } = useTranslation();
  const { state, retry } = useProfile();

  return (
    <div className="relative isolate mx-auto flex h-dvh max-w-3xl flex-col overflow-hidden">
      <span aria-hidden="true" className="fixed top-28 -right-44 -z-10 size-[26rem] rounded-full bg-coral max-md:hidden" />
      <AppHeader>
        <AccountMenu />
      </AppHeader>
      <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 pb-5 sm:px-8">
        {state.status === "ready" ? (
          <>
            <ProfileIdentity profile={state.profile} />
            {state.profile.guest && <GuestInvite />}
            <ProfileSheet profile={state.profile} />
          </>
        ) : (
          <>
            <h1 className="sr-only">{t("profile.title")}</h1>
            <ProfileMessage status={state.status} onRetry={retry} />
          </>
        )}
      </main>
    </div>
  );
}
