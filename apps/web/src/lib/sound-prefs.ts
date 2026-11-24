export interface SoundPrefs {
  readonly effects: boolean;
  readonly music: boolean;
}

const STORAGE_KEY = "apuntado.sonido";
export const DEFAULT_SOUND_PREFS: SoundPrefs = { effects: true, music: false };

const listeners = new Set<() => void>();
let current: SoundPrefs | null = null;

function readStored(): SoundPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_SOUND_PREFS;
    const parsed = JSON.parse(raw) as Partial<SoundPrefs>;
    return { effects: parsed.effects !== false, music: parsed.music === true };
  } catch {
    return DEFAULT_SOUND_PREFS;
  }
}

export function soundPrefs(): SoundPrefs {
  current ??= readStored();
  return current;
}

export function updateSoundPrefs(change: Partial<SoundPrefs>): void {
  const next = { ...soundPrefs(), ...change };
  current = next;
  listeners.forEach((listener) => listener());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return;
  }
}

export function subscribeSoundPrefs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
