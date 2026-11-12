"use client";

import Link from "next/link";

import { useTranslation } from "react-i18next";

import { UserIcon } from "@/components";
import { cn, profileHref } from "@/lib";

import { useRealtime } from "../context";

export function SessionBadge({ className }: { className?: string | undefined }) {
  const { t } = useTranslation();
  const { session } = useRealtime();
  const nickname = session.status === "ready" ? session.session.nickname : null;

  return (
    <Link
      href={profileHref()}
      aria-label={t("profile.open")}
      className={cn("flex items-center gap-2.5 rounded-full py-1 pr-1 pl-1 transition-colors hover:bg-ink/5 sm:pr-3", className)}
    >
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full border-[1.5px] border-ink bg-paper-light text-lg leading-none italic"
      >
        {nickname ? nickname.slice(0, 1).toUpperCase() : <UserIcon className="size-4" />}
      </span>
      <span className="hidden max-w-[10rem] truncate text-lg italic sm:block">{nickname ?? t("profile.title")}</span>
    </Link>
  );
}
