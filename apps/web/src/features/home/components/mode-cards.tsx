"use client";

import Image from "next/image";

import { useTranslation } from "react-i18next";

import { cardImageSrc, cn, GAME_MODES } from "@/lib";

import type { CardDto, GameMode } from "@apuntado/contracts";

const MODE_CARD: Readonly<Record<GameMode, CardDto>> = {
  CLASICA: { rank: "K", suit: "S" },
  APUNTADO: { rank: "J", suit: "D" },
  AMBAS: { rank: "Q", suit: "H" },
};

interface ModeCardsProps {
  value: GameMode;
  onChange: (mode: GameMode) => void;
}

export function ModeCards({ value, onChange }: ModeCardsProps) {
  const { t } = useTranslation();

  return (
    <fieldset className="flex flex-col">
      <legend className="label-caps mb-2.5 text-[0.65rem] text-ink-soft">{t("home.modesLegend")}</legend>
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {GAME_MODES.map((mode) => {
          const checked = mode === value;
          return (
            <label
              key={mode}
              className={cn(
                "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border-2 border-ink bg-card transition-[translate,rotate,box-shadow,background-color] duration-200 ease-spring has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-coral-ink",
                checked ? "-translate-y-1.5 -rotate-[1.5deg] bg-peach shadow-[4px_5px_0_var(--color-ink)]" : "shadow-[2px_2px_0_var(--color-ink)] hover:-translate-y-0.5",
              )}
            >
              <input type="radio" name="mode" value={mode} checked={checked} onChange={() => onChange(mode)} className="absolute inset-0 z-10 m-0 cursor-pointer appearance-none opacity-0" />
              <span aria-hidden="true" className="relative block aspect-[5/4] overflow-hidden border-b-2 border-ink bg-card short:aspect-[2/1]">
                <Image
                  src={cardImageSrc(MODE_CARD[mode])}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 9rem, 30vw"
                  className={cn(
                    "origin-[50%_14%] scale-[1.85] object-cover object-[50%_14%] transition-[scale,filter] duration-300 ease-glide",
                    checked ? "scale-[1.95]" : "grayscale-[35%] group-hover:grayscale-0",
                  )}
                />
              </span>
              <span className="flex flex-col gap-1 px-2 pt-2 pb-2.5 text-center">
                <span className="font-display text-[1.05rem] leading-none min-[400px]:text-[1.2rem] sm:text-[1.45rem]">{t(`home.modes.${mode}.title`)}</span>
                <span className="text-[0.75rem] leading-snug text-ink-soft short:hidden">{t(`home.modes.${mode}.detail`)}</span>
              </span>
              {checked && (
                <span aria-hidden="true" className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full border-2 border-ink bg-coral text-ink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
