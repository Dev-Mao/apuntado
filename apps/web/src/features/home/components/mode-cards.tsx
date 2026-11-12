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
    <fieldset className="flex flex-col">
      <legend className="label-caps mb-2 text-[0.62rem] text-paper/70">{t("settings.mode")}</legend>
      <div className="grid grid-cols-3 gap-2">
        {GAME_MODES.map((mode) => {
          const checked = mode === value;
          return (
            <label
              key={mode}
              className={cn(
                "relative flex cursor-pointer flex-col items-center gap-1 overflow-hidden rounded-2xl border-[1.5px] px-1.5 pt-3 pb-2.5 text-center transition-[border-color,background-color] duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-paper short:pt-2 short:pb-2",
                checked ? "border-coral bg-coral/15" : "border-paper/20 hover:border-paper/45",
              )}
            >
              <input type="radio" name="mode" value={mode} checked={checked} onChange={() => onChange(mode)} className="sr-only" />
              <SuitGlyph suit={MODE_SUIT[mode]} className={cn("size-4", checked ? "text-coral" : "text-paper/80")} />
              <span className="text-lg leading-tight italic">{t(`home.modes.${mode}.title`)}</span>
              <span className="label-caps text-[0.48rem] leading-relaxed text-paper/60 short:hidden">{t(`home.modes.${mode}.detail`)}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
