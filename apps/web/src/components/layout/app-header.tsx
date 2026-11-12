"use client";

import Link from "next/link";

import { useTranslation } from "react-i18next";

import { cn, ROUTES } from "@/lib";

import type { ReactNode } from "react";

interface AppHeaderProps {
  className?: string | undefined;
  homeLink?: boolean | undefined;
  children?: ReactNode;
}

const BRAND_CLASSES = "group flex items-baseline gap-3";

export function AppHeader({ className, homeLink = true, children }: AppHeaderProps) {
  const { t } = useTranslation();
  const brand = (
    <>
      <span className="font-display text-2xl font-bold tracking-tight italic sm:text-[1.7rem]">{t("brand.name")}</span>
      <span className="label-caps hidden text-[0.6rem] text-ink-soft sm:inline">{t("brand.course")}</span>
    </>
  );

  return (
    <header className={cn("flex items-center justify-between gap-4 px-5 py-4 sm:px-8", className)}>
      {homeLink ? (
        <Link href={ROUTES.HOME} aria-label={t("brand.home")} className={BRAND_CLASSES}>
          {brand}
        </Link>
      ) : (
        <p className={BRAND_CLASSES}>{brand}</p>
      )}
      {children}
    </header>
  );
}
