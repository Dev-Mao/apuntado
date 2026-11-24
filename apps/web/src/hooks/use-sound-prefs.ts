"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import { DEFAULT_SOUND_PREFS, soundPrefs, startMusic, stopMusic, subscribeSoundPrefs, updateSoundPrefs } from "@/lib";

export function useSoundPrefs() {
  const prefs = useSyncExternalStore(subscribeSoundPrefs, soundPrefs, () => DEFAULT_SOUND_PREFS);

  useEffect(() => {
    if (prefs.music) startMusic();
    else stopMusic();
  }, [prefs.music]);

  const toggleEffects = useCallback(() => updateSoundPrefs({ effects: !soundPrefs().effects }), []);
  const toggleMusic = useCallback(() => updateSoundPrefs({ music: !soundPrefs().music }), []);

  return { prefs, toggleEffects, toggleMusic };
}
