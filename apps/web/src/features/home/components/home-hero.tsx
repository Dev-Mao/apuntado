"use client";

import { useTranslation } from "react-i18next";

export function HomeHero() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="home-title" className="relative flex flex-col items-start">
      <h1 id="home-title" className="text-[clamp(4.2rem,18vw,8.2rem)] leading-[0.85] tracking-[-0.035em]">
        {t("home.title")}
      </h1>
      <p className="mt-6 max-w-[17rem] text-xl leading-snug italic sm:text-2xl">{t("home.tagline")}</p>
      <span aria-hidden="true" className="mt-6 h-px w-14 bg-ink/50" />
    </section>
  );
}
