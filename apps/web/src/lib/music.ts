import { audioContext, midiToHz, outputBus, playTone } from "./audio";

interface Chord {
  readonly bass: number;
  readonly voicing: readonly number[];
}

const HOME_CHORD: Chord = { bass: 38, voicing: [53, 57, 60, 64] };

const PROGRESSION: readonly Chord[] = [
  HOME_CHORD,
  { bass: 43, voicing: [53, 57, 59, 64] },
  { bass: 36, voicing: [52, 55, 59, 62] },
  { bass: 45, voicing: [55, 58, 61, 64] },
];

const BPM = 76;
const STEP = 60 / BPM / 2;
const STEPS_PER_BAR = 8;
const LOOKAHEAD = 0.3;
const TICK_MS = 100;
const MUSIC_LEVEL = 0.35;
const FADE = 1.2;
const MELODY_CHANCE = 0.5;

let timer: number | null = null;
let bus: GainNode | null = null;
let step = 0;
let nextAt = 0;

function scheduleStep(ctx: AudioContext, output: AudioNode, index: number, at: number): void {
  const chord = PROGRESSION[Math.floor(index / STEPS_PER_BAR) % PROGRESSION.length] ?? HOME_CHORD;
  const beat = index % STEPS_PER_BAR;
  if (beat === 0) {
    chord.voicing.forEach((note) =>
      playTone(ctx, output, { frequency: midiToHz(note), at, duration: STEP * STEPS_PER_BAR, level: 0.05, attack: 0.5 }),
    );
  }
  if (beat === 0 || beat === 4) playTone(ctx, output, { frequency: midiToHz(chord.bass), at, duration: STEP * 3, level: 0.2, type: "sine" });
  if (beat !== 0 && Math.random() < MELODY_CHANCE) {
    const note = chord.voicing[Math.floor(Math.random() * chord.voicing.length)] ?? chord.bass;
    playTone(ctx, output, { frequency: midiToHz(note + 12), at, duration: STEP * 2, level: 0.08 });
  }
}

function tick(ctx: AudioContext, output: AudioNode): void {
  nextAt = Math.max(nextAt, ctx.currentTime);
  while (nextAt < ctx.currentTime + LOOKAHEAD) {
    scheduleStep(ctx, output, step, nextAt);
    step += 1;
    nextAt += STEP;
  }
}

export function startMusic(): void {
  if (timer !== null) return;
  const ctx = audioContext();
  if (!ctx) return;
  const output = outputBus(ctx, 0);
  output.gain.linearRampToValueAtTime(MUSIC_LEVEL, ctx.currentTime + FADE);
  bus = output;
  step = 0;
  nextAt = ctx.currentTime + 0.1;
  timer = window.setInterval(() => tick(ctx, output), TICK_MS);
}

export function stopMusic(): void {
  if (timer === null) return;
  window.clearInterval(timer);
  timer = null;
  const ctx = audioContext();
  const output = bus;
  bus = null;
  if (!ctx || !output) return;
  output.gain.cancelScheduledValues(ctx.currentTime);
  output.gain.setValueAtTime(output.gain.value, ctx.currentTime);
  output.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE / 2);
  window.setTimeout(() => output.disconnect(), FADE * 1000);
}
