"use client";

import { useId } from "react";

import { useTranslation } from "react-i18next";

import { useSoundPrefs } from "@/hooks/use-sound-prefs";
import { cn } from "@/lib";

import { MusicIcon, SpeakerIcon } from "./icons";

const TOGGLE_CLASSES =
  "flex size-11 items-center justify-center rounded-full transition-colors hover:text-coral-ink";
const ROW_CLASSES = "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold transition-colors hover:bg-ink/5";

function Switch({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className={cn("ml-auto flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-ink p-0.5 transition-colors", on ? "justify-end bg-coral" : "bg-paper-deep")}>
      <span className="size-3 rounded-full bg-ink" />
    </span>
  );
}

interface SoundControlsProps {
  className?: string | undefined;
}

export function SoundControls({ className }: SoundControlsProps) {
  const { t } = useTranslation();
  const { prefs, toggleEffects, toggleMusic } = useSoundPrefs();
  const menuId = useId();
  const silent = !prefs.music && !prefs.effects;

  return (
    <div role="group" aria-label={t("sound.label")} className={cn("flex items-center", className)}>
      <button type="button" popoverTarget={menuId} className={cn(TOGGLE_CLASSES, "sm:hidden", silent && "text-ink/60")}>
        <SpeakerIcon muted={silent} className="size-5" />
        <span className="sr-only">{t("sound.label")}</span>
      </button>
      <div
        id={menuId}
        popover="auto"
        className="fixed inset-auto top-[calc(env(safe-area-inset-top,0px)+4rem)] right-4 m-0 w-64 rounded-2xl border-2 border-ink bg-paper-light p-2 text-ink shadow-stamp"
      >
        <button type="button" aria-pressed={prefs.music} onClick={toggleMusic} className={ROW_CLASSES}>
          <MusicIcon muted={!prefs.music} className="size-5" />
          {t("sound.music")}
          <Switch on={prefs.music} />
        </button>
        <button type="button" aria-pressed={prefs.effects} onClick={toggleEffects} className={ROW_CLASSES}>
          <SpeakerIcon muted={!prefs.effects} className="size-5" />
          {t("sound.effects")}
          <Switch on={prefs.effects} />
        </button>
      </div>
      <button type="button" aria-pressed={prefs.music} title={t(prefs.music ? "sound.musicOff" : "sound.musicOn")} onClick={toggleMusic} className={cn(TOGGLE_CLASSES, "max-sm:hidden", !prefs.music && "text-ink/60")}>
        <MusicIcon muted={!prefs.music} className="size-5" />
        <span className="sr-only">{t("sound.music")}</span>
      </button>
      <button type="button" aria-pressed={prefs.effects} title={t(prefs.effects ? "sound.effectsOff" : "sound.effectsOn")} onClick={toggleEffects} className={cn(TOGGLE_CLASSES, "max-sm:hidden", !prefs.effects && "text-ink/60")}>
        <SpeakerIcon muted={!prefs.effects} className="size-5" />
        <span className="sr-only">{t("sound.effects")}</span>
      </button>
    </div>
  );
}
