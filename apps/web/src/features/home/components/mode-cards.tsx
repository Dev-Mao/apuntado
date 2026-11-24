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
      <legend className="label-caps mb-2 text-[0.65rem] text-ink-soft">{t("home.modesLegend")}</legend>
      <div className="flex flex-col gap-2">
        {GAME_MODES.map((mode) => {
          const checked = mode === value;
          return (
            <label
              key={mode}
              className={cn(
                "relative flex cursor-pointer items-center gap-4 rounded-2xl border-2 py-2 pr-4 pl-3 transition-[border-color,background-color,box-shadow] duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-coral-ink",
                checked ? "border-ink bg-peach shadow-[3px_3px_0_var(--color-ink)]" : "border-ink/20 bg-card hover:border-ink/60",
              )}
            >
              <input type="radio" name="mode" value={mode} checked={checked} onChange={() => onChange(mode)} className="absolute inset-0 z-10 m-0 cursor-pointer appearance-none opacity-0" />
              <span
                aria-hidden="true"
                className={cn(
                  "relative block aspect-[5/7] w-11 shrink-0 overflow-hidden rounded-[0.4rem] border-[1.5px] border-ink bg-card transition-[rotate,scale] duration-300 ease-spring short:w-9",
                  checked ? "-rotate-6 scale-110" : "rotate-0",
                )}
              >
                <Image src={cardImageSrc(MODE_CARD[mode])} alt="" fill sizes="3rem" className="object-cover" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-display text-[1.35rem] leading-tight">{t(`home.modes.${mode}.title`)}</span>
                <span className="text-sm leading-snug text-ink-soft">{t(`home.modes.${mode}.detail`)}</span>
              </span>
              <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-ink bg-card">
                {checked && <span className="size-2.5 rounded-full bg-coral-ink" />}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
