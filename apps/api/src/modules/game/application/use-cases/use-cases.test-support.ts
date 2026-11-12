import { ManualClock } from "../../../../shared/manual-clock.test-support.js";
import { SeededRandom } from "../../../../shared/random.js";
import type { Card } from "../../domain/entities/card.js";
import type { GameMode } from "../../domain/match/match.js";
import type { Seat } from "../../domain/room/room.types.js";
import { OK, type Outcome, rejected } from "../../domain/round/round.types.js";
import { GameSession } from "../../domain/session/game-session.js";
import { InMemoryGameRepository } from "../../infrastructure/repositories/in-memory-game-repository.js";
import type { EventBus, IdGenerator, PlayJournal, PlayJournalEntry, StakeGuard } from "../ports/index.js";

export class FakeStakes implements StakeGuard {
  readonly holds: { matchId: string; playerIds: readonly string[]; stake: number }[] = [];

  constructor(private readonly balances: Readonly<Record<string, number>> = {}) {}

  canCover(playerId: string, stake: number): boolean {
    return (this.balances[playerId] ?? 0) >= stake;
  }

  hold(matchId: string, playerIds: readonly string[], stake: number): Outcome {
    if (playerIds.some((id) => !this.canCover(id, stake))) return rejected("Sin fichas suficientes");
    this.holds.push({ matchId, playerIds, stake });
    return OK;
  }
}

export const seatsOf = (playerIds: readonly string[]): Seat[] =>
  playerIds.map((playerId) => ({ playerId, nickname: playerId.toUpperCase(), isBot: false }));

export const sequentialIds = (): IdGenerator => {
  let n = 0;
  return { next: () => `match-${++n}` };
};

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
  const session = GameSession.start({ gameId: "g1", matchId: "m1" }, players, { mode, eliminationThreshold: 101, turnSeconds: 60 }, {
    random: new SeededRandom(3),
    clock,
    newDeck: () => [...deck],
  });
  session.pullEvents();
  games.save(session);
  return { clock, games, session, journal: new JournalSpy(), events: new EventSpy() };
};
