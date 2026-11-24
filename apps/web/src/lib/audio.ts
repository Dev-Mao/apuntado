let context: AudioContext | null = null;
let unlockArmed = false;

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

export function outputBus(ctx: AudioContext, level: number): GainNode {
  const bus = ctx.createGain();
  bus.gain.value = level;
  bus.connect(ctx.destination);
  return bus;
}

export function midiToHz(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}

interface ToneOptions {
  readonly frequency: number;
  readonly at: number;
  readonly duration: number;
  readonly level: number;
  readonly type?: OscillatorType;
  readonly attack?: number;
}

export function playTone(ctx: AudioContext, output: AudioNode, { frequency, at, duration, level, type = "triangle", attack = 0.01 }: ToneOptions): void {
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  envelope.gain.setValueAtTime(0, at);
  envelope.gain.linearRampToValueAtTime(level, at + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(envelope).connect(output);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.05);
}
