"use client";

import { useTranslation } from "react-i18next";

import { AppHeader } from "@/components";

import { useProfile } from "../hooks";
import { ProfileMessage } from "./profile-message";
import { ProfileSheet } from "./profile-sheet";

import type { ProfileView } from "@apuntado/contracts";

function ProfileIdentity({ profile }: { profile: ProfileView }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-4">
      <span
        aria-hidden="true"
        className="grid size-16 shrink-0 place-items-center rounded-full border-[1.5px] border-ink bg-coral text-3xl italic shadow-card"
      >
        {profile.nickname.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0">
        <h1 className="truncate text-[clamp(2.6rem,9vw,4.5rem)] leading-[0.95] tracking-[-0.02em]">{profile.nickname}</h1>
        <p className="label-caps mt-1 text-[0.6rem] text-ink-soft">{profile.guest ? t("profile.guest") : t("profile.member")}</p>
      </div>
    </div>
  );
}

export function ProfileScreen() {
  const { t } = useTranslation();
  const { state, retry } = useProfile();

  return (
    <div className="relative isolate mx-auto flex min-h-dvh max-w-3xl flex-col">
      <span aria-hidden="true" className="fixed top-28 -right-44 -z-10 size-[26rem] rounded-full bg-coral max-md:hidden" />
      <AppHeader />
      <main className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-12 sm:px-8">
        {state.status === "ready" ? (
          <>
            <ProfileIdentity profile={state.profile} />
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
