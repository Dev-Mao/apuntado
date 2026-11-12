"use client";

import Link from "next/link";

import { useTranslation } from "react-i18next";

import { Button, buttonClasses } from "@/components";
import { ROUTES } from "@/lib";

import type { ProfileState } from "../types";

type MessageStatus = Exclude<ProfileState["status"], "ready">;

const MESSAGE_KEYS = {
  loading: { title: "profile.loading", body: null },
  none: { title: "profile.none.title", body: "profile.none.body" },
  unavailable: { title: "profile.unavailable.title", body: "profile.unavailable.body" },
  failed: { title: "profile.failed.title", body: "common.unavailable" },
} as const satisfies Record<MessageStatus, { title: string; body: string | null }>;

interface ProfileMessageProps {
  status: MessageStatus;
  onRetry: () => void;
}

function MessageAction({ status, onRetry }: ProfileMessageProps) {
  const { t } = useTranslation();
  if (status === "none") {
    return (
      <Link href={ROUTES.HOME} className={buttonClasses()}>
        {t("profile.none.action")}
      </Link>
    );
  }
  if (status === "loading") return null;
  return <Button onClick={onRetry}>{t("profile.retry")}</Button>;
}

export function ProfileMessage({ status, onRetry }: ProfileMessageProps) {
  const { t } = useTranslation();
  const keys = MESSAGE_KEYS[status];

  return (
    <div role={status === "loading" ? "status" : undefined} className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="font-display font-semibold text-[2.4rem] leading-tight">{t(keys.title)}</p>
      {keys.body && <p className="max-w-md text-xl text-ink-soft italic">{t(keys.body)}</p>}
      <div className="mt-3 empty:hidden">
        <MessageAction status={status} onRetry={onRetry} />
      </div>
    </div>
  );
}
