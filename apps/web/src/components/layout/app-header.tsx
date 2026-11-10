"use client";

import Link from "next/link";

import { useTranslation } from "react-i18next";

import { cn, ROUTES } from "@/lib";

import type { ReactNode } from "react";

interface AppHeaderProps {
  className?: string | undefined;
  children?: ReactNode;
}

export function AppHeader({ className, children }: AppHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className={cn("flex items-center justify-between gap-4 px-5 py-4 sm:px-8", className)}>
      <Link href={ROUTES.HOME} aria-label={t("brand.home")} className="group flex items-baseline gap-3">
        <span className="font-display text-2xl font-bold tracking-tight italic sm:text-[1.7rem]">{t("brand.name")}</span>
        <span className="label-caps hidden text-[0.6rem] text-ink-soft sm:inline">{t("brand.course")}</span>
      </Link>
      {children}
    </header>
  );
}
