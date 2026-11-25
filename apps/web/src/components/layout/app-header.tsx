"use client";

import Link from "next/link";

import { useTranslation } from "react-i18next";

import { SoundControls, SuitGlyph } from "@/components/ui";
import { cn, ROUTES } from "@/lib";

import type { ReactNode } from "react";

interface AppHeaderProps {
  className?: string | undefined;
  homeLink?: boolean | undefined;
  children?: ReactNode;
}

const BRAND_CLASSES = "flex items-center gap-2 rounded-md sm:gap-3";

function Wordmark() {
  const { t } = useTranslation();
  return (
    <>
      <SuitGlyph suit="S" className="size-6 text-ink sm:size-7" />
      <span className="font-display text-[1.25rem] leading-none whitespace-nowrap sm:text-[1.45rem]">{t("brand.name")}</span>
    </>
  );
}

export function AppHeader({ className, homeLink = true, children }: AppHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className={cn("relative z-10 flex min-h-16 items-center justify-between gap-3 px-4 py-3 short:min-h-12 short:py-1.5 sm:px-8", className)}>
      <div className="flex items-center gap-5">
        {homeLink ? (
          <Link href={ROUTES.HOME} aria-label={t("brand.home")} className={BRAND_CLASSES}>
            <Wordmark />
          </Link>
        ) : (
          <p className={BRAND_CLASSES}>
            <Wordmark />
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 sm:gap-4">
        <SoundControls />
        {children}
      </div>
    </header>
  );
}
