"use client";

import Image from "next/image";

import { useTranslation } from "react-i18next";

import { Pill, PILL_TONE } from "@/components";

export function JokersComingSoon() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-ink/15 p-3">
      <Image src="/joker.png" alt="" width={400} height={560} className="w-14 shrink-0 rounded-[7%/5%] shadow-card" />
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-caps text-[0.65rem] text-ink-soft">{t("settings.jokers")}</span>
          <Pill tone={PILL_TONE.ACTIVE}>{t("settings.comingSoon")}</Pill>
        </div>
        <p className="text-sm italic text-ink-soft">{t("settings.jokersHint")}</p>
      </div>
    </div>
  );
}
