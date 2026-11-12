"use client";

import Link from "next/link";

import { useTranslation } from "react-i18next";

import { SuitGlyph } from "@/components/ui";
import { cn, ROUTES } from "@/lib";

import type { ReactNode } from "react";

interface AppHeaderProps {
  className?: string | undefined;
  homeLink?: boolean | undefined;
  children?: ReactNode;
}

const BRAND_CLASSES = "flex items-center gap-3 rounded-md";

function Wordmark() {
  const { t } = useTranslation();
  return (
    <>
      <SuitGlyph suit="S" className="size-7 text-ink" />
      <span className="label-caps text-[0.8rem] tracking-[0.3em]">{t("brand.name")}</span>
    </>
  );
}

export function AppHeader({ className, homeLink = true, children }: AppHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className={cn("relative z-10 flex min-h-16 items-center justify-between gap-4 px-4 py-3 short:min-h-12 short:py-1.5 sm:px-8", className)}>
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
        <span aria-hidden="true" className="hidden h-px w-14 bg-ink/40 sm:block" />
      </div>
      {children}
    </header>
  );
}
