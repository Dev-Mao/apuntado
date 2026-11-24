"use client";

import { useTranslation } from "react-i18next";

import { CARD_SIZE, CardFan } from "@/components";

import type { CardDto } from "@apuntado/contracts";

const QUEENS: readonly CardDto[] = [
  { rank: "Q", suit: "S" },
  { rank: "Q", suit: "H" },
  { rank: "Q", suit: "D" },
];

export function HomeHero() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="home-title" className="flex flex-col items-start">
      <p className="label-caps flex items-center gap-3 text-[0.7rem] text-coral-ink">
        <span aria-hidden="true" className="h-0.5 w-8 rounded-full bg-coral-ink" />
        {t("home.kicker")}
      </p>
      <h1
        id="home-title"
        className="mt-3 font-display text-[clamp(3.2rem,13vw,4.6rem)] leading-[0.9] tracking-[-0.02em] short:text-[clamp(2.8rem,10vw,3.6rem)] md:short:text-[4.4rem] lg:text-[clamp(5rem,7.5vw,7rem)] lg:short:text-[4.4rem]"
      >
        {t("home.title")}
      </h1>
      <p className="mt-3 max-w-[22rem] text-xl leading-snug text-ink-soft tiny:hidden lg:mt-5 lg:text-[1.4rem]">{t("home.tagline")}</p>
      <figure className="mt-10 hidden flex-col items-start gap-5 lg:flex [@media(max-height:40rem)]:hidden">
        <CardFan
          cards={QUEENS}
          spreadDeg={9}
          size={CARD_SIZE.FLUID}
          overlapClassName="-ml-[4.6rem] first:ml-0 shadow-lift"
          className="pl-4 [--card-w:9.5rem] [@media(max-height:46rem)]:[--card-w:7.5rem]"
        />
        <figcaption className="max-w-[22rem] text-ink-soft">
          <span className="font-semibold text-ink">{t("home.heroCaption")}</span> {t("home.heroCredit")}
        </figcaption>
      </figure>
    </section>
  );
}
