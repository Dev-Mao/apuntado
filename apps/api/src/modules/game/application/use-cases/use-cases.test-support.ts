import { ManualClock } from "../../../../shared/manual-clock.test-support.js";
import { SeededRandom } from "../../../../shared/random.js";
import type { Card } from "../../domain/entities/card.js";
import type { GameMode } from "../../domain/match/match.js";
import { GameSession } from "../../domain/session/game-session.js";
import { InMemoryGameRepository } from "../../infrastructure/repositories/in-memory-game-repository.js";
import type { EventBus, PlayJournal, PlayJournalEntry } from "../ports/index.js";

export class JournalSpy implements PlayJournal {
  readonly entries: PlayJournalEntry[] = [];
  record(entry: PlayJournalEntry): void {
    this.entries.push(entry);
  }
}

export class EventSpy implements EventBus {
  readonly published: { name: string; payload: Record<string, unknown> }[] = [];
  publish(name: string, payload: Record<string, unknown>): void {
    this.published.push({ name, payload });
  }
  get names(): string[] {
    return this.published.map((e) => e.name);
  }
}

export const harness = (deck: readonly Card[], mode: GameMode = "AMBAS", players = ["luis", "ana"]) => {
  const clock = new ManualClock();
  const games = new InMemoryGameRepository();
  const session = GameSession.start("g1", players, { mode, eliminationThreshold: 101, turnSeconds: 60 }, {
    random: new SeededRandom(3),
    clock,
    newDeck: () => [...deck],
  });
  games.save(session);
  return { clock, games, session, journal: new JournalSpy(), events: new EventSpy() };
};
