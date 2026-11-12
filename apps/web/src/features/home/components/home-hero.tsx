"use client";

import { useTranslation } from "react-i18next";

import { CardFan } from "@/components";

import type { CardDto } from "@apuntado/contracts";

const HERO_CARDS: readonly CardDto[] = [
  { rank: "7", suit: "H" },
  { rank: "8", suit: "H" },
  { rank: "9", suit: "H" },
  { rank: "Q", suit: "S" },
];

export function HomeHero() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="home-title" className="flex flex-col items-start">
      <h1
        id="home-title"
        className="font-display text-[clamp(3.4rem,15vw,7.6rem)] leading-[0.88] font-semibold tracking-[-0.03em] short:text-[clamp(2.8rem,12vw,5rem)]"
      >
        {t("home.title")}
      </h1>
      <p className="mt-3 max-w-[19rem] text-xl leading-snug italic short:hidden sm:mt-5 sm:text-2xl">{t("home.tagline")}</p>
      <span aria-hidden="true" className="mt-5 hidden h-px w-14 bg-ink/50 lg:block" />
      <CardFan cards={HERO_CARDS} spreadDeg={8} className="mt-12 hidden pl-3 lg:flex [@media(max-height:46rem)]:hidden" />
    </section>
  );
}
