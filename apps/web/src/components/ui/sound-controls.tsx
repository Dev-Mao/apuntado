"use client";

import { useTranslation } from "react-i18next";

import { useSoundPrefs } from "@/hooks/use-sound-prefs";
import { cn } from "@/lib";

import { MusicIcon, SpeakerIcon } from "./icons";

const TOGGLE_CLASSES =
  "flex size-10 items-center sm:size-11 justify-center rounded-full transition-colors hover:text-coral-ink";

interface SoundControlsProps {
  className?: string | undefined;
}

export function SoundControls({ className }: SoundControlsProps) {
  const { t } = useTranslation();
  const { prefs, toggleEffects, toggleMusic } = useSoundPrefs();

  return (
    <div role="group" aria-label={t("sound.label")} className={cn("flex items-center", className)}>
      <button type="button" aria-pressed={prefs.music} title={t(prefs.music ? "sound.musicOff" : "sound.musicOn")} onClick={toggleMusic} className={cn(TOGGLE_CLASSES, !prefs.music && "text-ink/45")}>
        <MusicIcon muted={!prefs.music} className="size-5" />
        <span className="sr-only">{t("sound.music")}</span>
      </button>
      <button type="button" aria-pressed={prefs.effects} title={t(prefs.effects ? "sound.effectsOff" : "sound.effectsOn")} onClick={toggleEffects} className={cn(TOGGLE_CLASSES, !prefs.effects && "text-ink/45")}>
        <SpeakerIcon muted={!prefs.effects} className="size-5" />
        <span className="sr-only">{t("sound.effects")}</span>
      </button>
    </div>
  );
}
