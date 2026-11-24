import { audioContext, midiToHz, outputBus, playTone } from "./audio";
import { soundPrefs } from "./sound-prefs";

export type SoundEffect = "deal" | "draw" | "discard" | "turn" | "roundOver" | "win" | "lose";

const EFFECTS_LEVEL = 0.6;
const DEAL_CARDS = 6;
const DEAL_GAP = 0.06;

let bus: GainNode | null = null;
let noise: AudioBuffer | null = null;

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noise) return noise;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  noise = buffer;
  return buffer;
}

function cardSnap(ctx: AudioContext, output: AudioNode, at: number, frequency: number, duration: number): void {
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const envelope = ctx.createGain();
  source.buffer = noiseBuffer(ctx);
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = 0.9;
  envelope.gain.setValueAtTime(0.5, at);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  source.connect(filter).connect(envelope).connect(output);
  source.start(at);
  source.stop(at + duration);
}

function melody(ctx: AudioContext, output: AudioNode, at: number, notes: readonly number[], gap: number, length: number): void {
  notes.forEach((note, index) => playTone(ctx, output, { frequency: midiToHz(note), at: at + index * gap, duration: length, level: 0.22 }));
}

const EFFECTS: Record<SoundEffect, (ctx: AudioContext, output: AudioNode, at: number) => void> = {
  deal: (ctx, output, at) => {
    for (let i = 0; i < DEAL_CARDS; i += 1) cardSnap(ctx, output, at + i * DEAL_GAP, 1700 + i * 60, 0.06);
  },
  draw: (ctx, output, at) => cardSnap(ctx, output, at, 1900, 0.07),
  discard: (ctx, output, at) => {
    cardSnap(ctx, output, at, 1100, 0.1);
    playTone(ctx, output, { frequency: 140, at, duration: 0.12, level: 0.18, type: "sine" });
  },
  turn: (ctx, output, at) => melody(ctx, output, at, [76, 81], 0.12, 0.35),
  roundOver: (ctx, output, at) => melody(ctx, output, at, [72, 76, 79], 0.09, 0.6),
  win: (ctx, output, at) => melody(ctx, output, at, [72, 76, 79, 84], 0.11, 0.7),
  lose: (ctx, output, at) => melody(ctx, output, at, [67, 63, 60], 0.18, 0.6),
};

export function playSound(effect: SoundEffect): void {
  if (!soundPrefs().effects) return;
  const ctx = audioContext();
  if (!ctx) return;
  bus ??= outputBus(ctx, EFFECTS_LEVEL);
  EFFECTS[effect](ctx, bus, ctx.currentTime + 0.01);
}
