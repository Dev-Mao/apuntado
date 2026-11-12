"use client";

import { useTranslation } from "react-i18next";

export function HomeHero() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="home-title" className="relative flex flex-col items-start">
      <h1 id="home-title" className="font-display font-semibold text-[clamp(4rem,17vw,7.6rem)] leading-[0.88] tracking-[-0.03em]">
        {t("home.title")}
      </h1>
      <p className="mt-6 max-w-[17rem] text-xl leading-snug italic sm:text-2xl">{t("home.tagline")}</p>
      <span aria-hidden="true" className="mt-6 h-px w-14 bg-ink/50" />
    </section>
  );
}
