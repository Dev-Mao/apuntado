"use client";

import { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { DEFAULT_LOCALE } from "@/lib/i18n";

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" };

export function useMatchFormat() {
  const { t } = useTranslation();

  return useMemo(() => {
    const dates = new Intl.DateTimeFormat(`${DEFAULT_LOCALE}-CO`, DATE_FORMAT);
    const lists = new Intl.ListFormat(DEFAULT_LOCALE, { type: "conjunction" });
    return {
      date: (iso: string) => dates.format(new Date(iso)),
      rivals: (names: readonly string[]) =>
        names.length > 0 ? t("profile.match.rivals", { names: lists.format(names) }) : t("profile.match.noRivals"),
    };
  }, [t]);
}
