import { audioContext, midiToHz, noiseBuffer, outputBus, playKey, playNoise, playTone } from "./audio";

interface Chord {
  readonly bass: number;
  readonly voicing: readonly number[];
}

const HOME_CHORD: Chord = { bass: 41, voicing: [57, 60, 64, 67] };

const PROGRESSION: readonly Chord[] = [
  HOME_CHORD,
  { bass: 40, voicing: [55, 59, 62, 64] },
  { bass: 38, voicing: [53, 57, 60, 64] },
  { bass: 36, voicing: [52, 55, 59, 62] },
];

const BPM = 72;
const STEP = 60 / BPM / 2;
const STEPS_PER_BAR = 8;
const BAR = STEP * STEPS_PER_BAR;
const SWING = STEP * 0.16;
const STRUM = 0.028;
const LOOKAHEAD = 0.35;
const TICK_MS = 100;
const MUSIC_LEVEL = 0.95;
const MUSIC_WARMTH = 1700;
const FADE = 1.6;
const KICK_BEATS = new Set([0, 3]);
const SNARE_BEATS = new Set([2, 6]);

let timer: number | null = null;
let bus: GainNode | null = null;
let hiss: AudioBufferSourceNode | null = null;
let step = 0;
let nextAt = 0;

function chordAt(index: number): Chord {
  return PROGRESSION[Math.floor(index / STEPS_PER_BAR) % PROGRESSION.length] ?? HOME_CHORD;
}

function strum(ctx: AudioContext, output: AudioNode, chord: Chord, at: number, level: number): void {
  chord.voicing.forEach((note, index) => playKey(ctx, output, { note, at: at + index * STRUM, duration: BAR * 0.9, level }));
}

function kick(ctx: AudioContext, output: AudioNode, at: number): void {
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.frequency.setValueAtTime(110, at);
  oscillator.frequency.exponentialRampToValueAtTime(42, at + 0.14);
  envelope.gain.setValueAtTime(0.32, at);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
  oscillator.connect(envelope).connect(output);
  oscillator.start(at);
  oscillator.stop(at + 0.35);
}

function drums(ctx: AudioContext, output: AudioNode, beat: number, at: number): void {
  if (KICK_BEATS.has(beat)) kick(ctx, output, at);
  if (SNARE_BEATS.has(beat)) {
    playNoise(ctx, output, { at, duration: 0.2, level: 0.05, frequency: 1800, filter: "bandpass", attack: 0.008 });
    playTone(ctx, output, { frequency: 190, at, duration: 0.09, level: 0.03 });
  }
  playNoise(ctx, output, { at, duration: 0.04, level: beat % 2 === 1 ? 0.018 : 0.01, frequency: 6500, filter: "highpass" });
}

function harmony(ctx: AudioContext, output: AudioNode, chord: Chord, beat: number, at: number): void {
  if (beat === 0) {
    strum(ctx, output, chord, at, 0.05);
    playTone(ctx, output, { frequency: midiToHz(chord.bass), at, duration: 1.3, level: 0.17, attack: 0.02 });
  }
  if (beat === 3) playTone(ctx, output, { frequency: midiToHz(chord.bass + 7), at, duration: 0.5, level: 0.08, attack: 0.02 });
  if (beat === 5 && Math.random() < 0.5) strum(ctx, output, chord, at, 0.03);
  if (beat % 2 === 1 && Math.random() < 0.2) {
    const note = chord.voicing[Math.floor(Math.random() * chord.voicing.length)] ?? chord.bass;
    playKey(ctx, output, { note: note + 12, at, duration: 1.1, level: 0.035 });
  }
}

function crackle(ctx: AudioContext, output: AudioNode, at: number): void {
  if (Math.random() > 0.6) return;
  const offset = Math.random() * STEP;
  playNoise(ctx, output, { at: at + offset, duration: 0.008, level: 0.02 + Math.random() * 0.04, frequency: 2500, filter: "highpass", attack: 0.001 });
}

function scheduleStep(ctx: AudioContext, output: AudioNode, index: number, at: number): void {
  const beat = index % STEPS_PER_BAR;
  harmony(ctx, output, chordAt(index), beat, at);
  drums(ctx, output, beat, at);
  crackle(ctx, output, at);
}

function tick(ctx: AudioContext, output: AudioNode): void {
  nextAt = Math.max(nextAt, ctx.currentTime);
  while (nextAt < ctx.currentTime + LOOKAHEAD) {
    scheduleStep(ctx, output, step, nextAt + (step % 2 === 1 ? SWING : 0));
    step += 1;
    nextAt += STEP;
  }
}

function startHiss(ctx: AudioContext, output: AudioNode): AudioBufferSourceNode {
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const level = ctx.createGain();
  source.buffer = noiseBuffer(ctx);
  source.loop = true;
  filter.type = "bandpass";
  filter.frequency.value = 4200;
  filter.Q.value = 0.6;
  level.gain.value = 0.012;
  source.connect(filter).connect(level).connect(output);
  source.start();
  return source;
}

export function startMusic(): void {
  if (timer !== null) return;
  const ctx = audioContext();
  if (!ctx) return;
  const output = outputBus(ctx, 0, MUSIC_WARMTH);
  output.gain.linearRampToValueAtTime(MUSIC_LEVEL, ctx.currentTime + FADE);
  bus = output;
  hiss = startHiss(ctx, output);
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
  const noise = hiss;
  bus = null;
  hiss = null;
  if (!ctx || !output) return;
  output.gain.cancelScheduledValues(ctx.currentTime);
  output.gain.setValueAtTime(output.gain.value, ctx.currentTime);
  output.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE / 2);
  window.setTimeout(() => {
    noise?.stop();
    output.disconnect();
  }, FADE * 1000);
}
