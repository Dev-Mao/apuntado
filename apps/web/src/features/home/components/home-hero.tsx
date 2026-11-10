"use client";

import { useTranslation } from "react-i18next";

import { CARD_SIZE, PlayingCard } from "@/components";

import type { CardDto } from "@apuntado/contracts";

const HERO_CARDS: readonly CardDto[] = [
  { rank: "A", suit: "H" },
  { rank: "K", suit: "S" },
  { rank: "7", suit: "D" },
  { rank: "Q", suit: "C" },
];

const FAN_CLASSES = [
  "-rotate-[16deg] translate-y-5",
  "-rotate-[5deg] -ml-8 sm:-ml-10",
  "rotate-[5deg] -ml-8 sm:-ml-10",
  "rotate-[16deg] translate-y-5 -ml-8 sm:-ml-10",
];

export function HomeHero() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="home-title" className="relative flex flex-col">
      <p className="label-caps text-[0.7rem] text-coral-deep">{t("home.eyebrow")}</p>
      <h1 id="home-title" className="mt-3 font-display text-[clamp(3.8rem,10vw,8.5rem)] leading-[0.85] font-medium tracking-tight">
        {t("home.title")}
      </h1>
      <p className="mt-4 font-display text-xl text-ink-soft italic sm:text-2xl">{t("home.tagline")}</p>
      <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">{t("home.intro")}</p>

      <div aria-hidden="true" className="relative mt-8 h-52 overflow-hidden sm:h-72 lg:mt-auto">
        <span className="absolute -bottom-36 -left-16 size-72 rounded-full bg-coral sm:-bottom-44 sm:size-96" />
        <span className="absolute right-0 -bottom-24 size-40 rounded-full bg-coral sm:size-56" />
        <span className="absolute inset-x-6 bottom-0 h-40 rounded-t-[50%] bg-felt sm:inset-x-12 sm:h-56" />
        <span className="absolute inset-x-0 bottom-6 flex justify-center sm:bottom-10">
          {HERO_CARDS.map((card, index) => (
            <PlayingCard key={`${card.rank}${card.suit}`} card={card} size={CARD_SIZE.LG} className={FAN_CLASSES[index]} />
          ))}
        </span>
      </div>
    </section>
  );
}
