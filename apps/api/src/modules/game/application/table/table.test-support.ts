import { InProcessEventBus } from "../../../../shared/in-process-event-bus.js";
import { ManualClock } from "../../../../shared/manual-clock.test-support.js";
import { SeededRandom } from "../../../../shared/random.js";
import { composeGame } from "../../game.composition.js";
import { InMemoryPlayJournal } from "../../infrastructure/journal/in-memory-play-journal.js";
import type { AuthenticatedPlayer, Presence, TableNotifier, TaskScheduler } from "../ports/index.js";

export class FakeScheduler implements TaskScheduler {
  readonly tasks = new Map<string, { at: Date; task: () => void }>();

  constructor(private readonly clock: ManualClock) {}

  schedule(key: string, at: Date, task: () => void): void {
    this.tasks.set(key, { at, task });
  }

  cancel(key: string): void {
    this.tasks.delete(key);
  }

  runNext(): boolean {
    const next = [...this.tasks.entries()].sort(([, a], [, b]) => a.at.getTime() - b.at.getTime())[0];
    if (!next) return false;
    const [key, { at, task }] = next;
    this.tasks.delete(key);
    const wait = (at.getTime() - this.clock.now().getTime()) / 1000;
    if (wait > 0) this.clock.advance(wait);
    task();
    return true;
  }
}

export class NotifierSpy implements TableNotifier {
  readonly lobby: string[] = [];
  readonly table: string[] = [];
  lobbyChanged(code: string): void {
    this.lobby.push(code);
  }
  tableChanged(code: string): void {
    this.table.push(code);
  }
}

export class FakePresence implements Presence {
  readonly online = new Set<string>();
  isConnected(playerId: string): boolean {
    return this.online.has(playerId);
  }
}

export const player = (id: string, guest = true): AuthenticatedPlayer => ({ id, nickname: id.toUpperCase(), guest });

export const SETTINGS = { mode: "CLASICA", eliminationThreshold: 101, turnSeconds: 60, stake: 0 } as const;

export const tableHarness = (seed = 7) => {
  const clock = new ManualClock();
  const scheduler = new FakeScheduler(clock);
  const notifier = new NotifierSpy();
  const presence = new FakePresence();
  const journal = new InMemoryPlayJournal();
  const components = composeGame({
    clock,
    random: new SeededRandom(seed),
    scheduler,
    notifier,
    presence,
    journal,
    events: new InProcessEventBus(),
    timing: { botDelayMs: 1200, roundPauseMs: 8000, cleanupMs: 60_000 },
  });
  return { clock, scheduler, notifier, presence, journal, ...components };
};
