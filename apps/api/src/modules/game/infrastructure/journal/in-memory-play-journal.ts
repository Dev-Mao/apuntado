import type { PlayJournal, PlayJournalEntry } from "../../application/ports/index.js";

export class InMemoryPlayJournal implements PlayJournal {
  private readonly log: PlayJournalEntry[] = [];

  record(entry: PlayJournalEntry): void {
    this.log.push(entry);
  }

  entriesOf(gameId: string): readonly PlayJournalEntry[] {
    return this.log.filter((e) => e.gameId === gameId);
  }
}
