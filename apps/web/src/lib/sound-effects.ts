import { audioContext, outputBus, playKey, playNoise, playTone } from "./audio";
import { soundPrefs } from "./sound-prefs";

export type SoundEffect = "deal" | "draw" | "discard" | "turn" | "roundOver" | "win" | "lose";

const EFFECTS_LEVEL = 0.7;
const EFFECTS_WARMTH = 2400;
const DEAL_CARDS = 5;
const DEAL_GAP = 0.085;

let bus: GainNode | null = null;

function cardSlide(ctx: AudioContext, output: AudioNode, at: number, level: number): void {
  playNoise(ctx, output, { at, duration: 0.16, level, frequency: 1300, attack: 0.03 });
}

function arpeggio(ctx: AudioContext, output: AudioNode, at: number, notes: readonly number[], gap: number, length: number): void {
  notes.forEach((note, index) => playKey(ctx, output, { note, at: at + index * gap, duration: length, level: 0.13 }));
}

const EFFECTS: Record<SoundEffect, (ctx: AudioContext, output: AudioNode, at: number) => void> = {
  deal: (ctx, output, at) => {
    for (let i = 0; i < DEAL_CARDS; i += 1) cardSlide(ctx, output, at + i * DEAL_GAP, 0.12);
  },
  draw: (ctx, output, at) => cardSlide(ctx, output, at, 0.2),
  discard: (ctx, output, at) => {
    playNoise(ctx, output, { at, duration: 0.09, level: 0.12, frequency: 800 });
    playTone(ctx, output, { frequency: 96, at, duration: 0.18, level: 0.22 });
  },
  turn: (ctx, output, at) => arpeggio(ctx, output, at, [69, 76], 0.14, 1.4),
  roundOver: (ctx, output, at) => arpeggio(ctx, output, at, [65, 69, 72, 76], 0.08, 1.8),
  win: (ctx, output, at) => arpeggio(ctx, output, at, [60, 64, 67, 71, 74], 0.1, 2.2),
  lose: (ctx, output, at) => arpeggio(ctx, output, at, [69, 65, 62], 0.18, 1.6),
};

export function playSound(effect: SoundEffect): void {
  if (!soundPrefs().effects) return;
  const ctx = audioContext();
  if (!ctx || ctx.state !== "running") return;
  bus ??= outputBus(ctx, EFFECTS_LEVEL, EFFECTS_WARMTH);
  EFFECTS[effect](ctx, bus, ctx.currentTime + 0.01);
}
