import type { Database } from "../../../../shared/database/database.js";
import { requireRows } from "../../../../shared/database/sql-client.js";
import type { PlayJournal, PlayJournalEntry } from "../../application/ports/index.js";

interface TurnCursor {
  readonly round: number;
  readonly seat: number;
  readonly turn: number;
  readonly sequence: number;
}

const INSERT_PLAY = `
INSERT INTO turno_jugada (ronda_id, participacion_id, numero_turno, secuencia, accion, carta_codigo, registrado_en)
SELECT r.id, p.id, $4, $5, $6, $7, $8
FROM ronda r
JOIN participacion p ON p.partida_id = r.partida_id AND p.posicion = $3
WHERE r.partida_id = $1 AND r.numero = $2
RETURNING id`;

const advance = (previous: TurnCursor | undefined, entry: PlayJournalEntry): TurnCursor => {
  if (!previous || previous.round !== entry.roundNumber) return { round: entry.roundNumber, seat: entry.seat, turn: 1, sequence: 1 };
  if (previous.seat !== entry.seat) return { ...previous, seat: entry.seat, turn: previous.turn + 1, sequence: 1 };
  return { ...previous, sequence: previous.sequence + 1 };
};

export class PgPlayJournal implements PlayJournal {
  private readonly cursors = new Map<string, TurnCursor>();

  constructor(private readonly database: Database) {}

  record(entry: PlayJournalEntry): void {
    const cursor = advance(this.cursors.get(entry.matchId), entry);
    if (entry.action === "DECLARAR_CIERRE") this.cursors.delete(entry.matchId);
    else this.cursors.set(entry.matchId, cursor);
    const params = [entry.matchId, entry.roundNumber, entry.seat, cursor.turn, cursor.sequence, entry.action, entry.cardId, entry.occurredAt];
    this.database.queue.enqueue(async () => {
      requireRows(await this.database.sql.query(INSERT_PLAY, params), `round ${entry.roundNumber} of match ${entry.matchId}`);
    });
  }
}
