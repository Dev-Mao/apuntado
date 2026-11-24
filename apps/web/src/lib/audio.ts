let context: AudioContext | null = null;
let unlockArmed = false;
let noise: AudioBuffer | null = null;

function armUnlock(ctx: AudioContext): void {
  if (unlockArmed) return;
  unlockArmed = true;
  const unlock = () => {
    void ctx.resume();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

export function audioContext(): AudioContext | null {
  if (typeof window === "undefined" || typeof window.AudioContext !== "function") return null;
  context ??= new window.AudioContext();
  if (context.state === "suspended") {
    void context.resume();
    armUnlock(context);
  }
  return context;
}

export function outputBus(ctx: AudioContext, level: number, warmth: number): GainNode {
  const bus = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = warmth;
  filter.Q.value = 0.4;
  bus.gain.value = level;
  bus.connect(filter).connect(ctx.destination);
  return bus;
}

export function midiToHz(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}

export function noiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noise) return noise;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  noise = buffer;
  return buffer;
}

interface ToneOptions {
  readonly frequency: number;
  readonly at: number;
  readonly duration: number;
  readonly level: number;
  readonly type?: OscillatorType;
  readonly attack?: number;
  readonly detune?: number;
}

export function playTone(ctx: AudioContext, output: AudioNode, { frequency, at, duration, level, type = "sine", attack = 0.01, detune = 0 }: ToneOptions): void {
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  oscillator.detune.value = detune;
  envelope.gain.setValueAtTime(0, at);
  envelope.gain.linearRampToValueAtTime(level, at + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(envelope).connect(output);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.05);
}

interface KeyOptions {
  readonly note: number;
  readonly at: number;
  readonly duration: number;
  readonly level: number;
}

export function playKey(ctx: AudioContext, output: AudioNode, { note, at, duration, level }: KeyOptions): void {
  const frequency = midiToHz(note);
  const wobble = (Math.random() - 0.5) * 8;
  playTone(ctx, output, { frequency, at, duration, level, attack: 0.012, detune: wobble });
  playTone(ctx, output, { frequency: frequency * 2, at, duration: duration * 0.45, level: level * 0.22, attack: 0.006, detune: wobble + 5 });
  playTone(ctx, output, { frequency, at, duration: duration * 0.8, level: level * 0.18, type: "triangle", attack: 0.02, detune: wobble - 7 });
}

interface NoiseOptions {
  readonly at: number;
  readonly duration: number;
  readonly level: number;
  readonly frequency: number;
  readonly filter?: BiquadFilterType;
  readonly attack?: number;
}

export function playNoise(ctx: AudioContext, output: AudioNode, { at, duration, level, frequency, filter = "lowpass", attack = 0.004 }: NoiseOptions): void {
  const source = ctx.createBufferSource();
  const shape = ctx.createBiquadFilter();
  const envelope = ctx.createGain();
  source.buffer = noiseBuffer(ctx);
  shape.type = filter;
  shape.frequency.value = frequency;
  envelope.gain.setValueAtTime(0, at);
  envelope.gain.linearRampToValueAtTime(level, at + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  source.connect(shape).connect(envelope).connect(output);
  source.start(at, Math.random() * 1.5);
  source.stop(at + duration + 0.05);
}
