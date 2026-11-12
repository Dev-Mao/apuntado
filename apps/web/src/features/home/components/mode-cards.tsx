"use client";

import { useTranslation } from "react-i18next";

import { SuitGlyph } from "@/components";
import { cn, GAME_MODES } from "@/lib";

import type { GameMode, Suit } from "@apuntado/contracts";

const MODE_SUIT: Readonly<Record<GameMode, Suit>> = {
  CLASICA: "S",
  APUNTADO: "D",
  AMBAS: "C",
};

interface ModeCardsProps {
  value: GameMode;
  onChange: (mode: GameMode) => void;
}

export function ModeCards({ value, onChange }: ModeCardsProps) {
  const { t } = useTranslation();

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="label-caps mb-4 flex items-center gap-4 text-[0.68rem]">
        {t("settings.mode")}
        <span aria-hidden="true" className="h-px w-12 bg-ink/40" />
      </legend>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {GAME_MODES.map((mode) => {
          const checked = mode === value;
          return (
            <label
              key={mode}
              className={cn(
                "relative flex cursor-pointer flex-col items-center gap-1.5 overflow-hidden rounded-2xl border-[1.5px] bg-paper-light/70 px-2 pt-4 pb-3 text-center transition-[border-color,box-shadow] duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-coral-ink sm:px-3 sm:pt-5",
                checked ? "border-coral shadow-[0_10px_24px_-14px_rgb(224_122_95/0.9)]" : "border-line hover:border-ink/40",
              )}
            >
              <input type="radio" name="mode" value={mode} checked={checked} onChange={() => onChange(mode)} className="sr-only" />
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -bottom-10 -left-10 size-20 rounded-full bg-salmon/70 transition-[scale,opacity] duration-300 ease-spring",
                  checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
                )}
              />
              <SuitGlyph suit={MODE_SUIT[mode]} className="relative size-5" />
              <span className="relative text-xl leading-tight italic sm:text-2xl">{t(`home.modes.${mode}.title`)}</span>
              <span className="label-caps relative text-[0.5rem] leading-relaxed text-ink-soft sm:text-[0.55rem]">
                {t(`home.modes.${mode}.detail`)}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
