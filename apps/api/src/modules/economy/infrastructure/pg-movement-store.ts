import type { MovementReason as ReasonView, WalletMovement } from "@apuntado/contracts";
import type { Database } from "../../../shared/database/database.js";
import type { MovementStore } from "../application/ports.js";
import type { ChipMovement, StakeHold } from "../domain/chip-ledger.js";

const BALANCES = "SELECT jugador_id AS player_id, saldo::int AS balance FROM saldo_jugador";

const UNSETTLED_HOLDS = `
SELECT h.partida_id AS match_id, array_agg(h.jugador_id::text ORDER BY h.id) AS player_ids, MIN(-h.monto)::int AS stake
FROM movimiento_ficha h
WHERE h.motivo = 'APUESTA_RETENIDA'
  AND NOT EXISTS (
    SELECT 1 FROM movimiento_ficha s
    WHERE s.partida_id = h.partida_id AND s.motivo IN ('BOTE_GANADO', 'APUESTA_DEVUELTA')
  )
GROUP BY h.partida_id`;

const RECENT = `
SELECT monto AS amount, motivo AS reason, partida_id AS match_id, creado_en AS at
FROM movimiento_ficha
WHERE jugador_id = $1
ORDER BY id DESC
LIMIT $2`;

const INSERT = "INSERT INTO movimiento_ficha (jugador_id, monto, motivo, partida_id) VALUES ($1, $2, $3, $4)";

interface RecentRow {
  readonly amount: number;
  readonly reason: ReasonView;
  readonly match_id: string | null;
  readonly at: Date;
}

export class PgMovementStore implements MovementStore {
  constructor(private readonly database: Database) {}

  async balances(): Promise<ReadonlyMap<string, number>> {
    const rows = await this.database.sql.query<{ player_id: string; balance: number }>(BALANCES);
    return new Map(rows.map((row) => [row.player_id, row.balance]));
  }

  async unsettledHolds(): Promise<readonly StakeHold[]> {
    const rows = await this.database.sql.query<{ match_id: string; player_ids: string[]; stake: number }>(UNSETTLED_HOLDS);
    return rows.map((row) => ({ matchId: row.match_id, playerIds: row.player_ids, stake: row.stake }));
  }

  async recent(playerId: string, limit: number): Promise<readonly WalletMovement[]> {
    const rows = await this.database.sql.query<RecentRow>(RECENT, [playerId, limit]);
    return rows.map((row) => ({ amount: row.amount, reason: row.reason, matchId: row.match_id, at: new Date(row.at).toISOString() }));
  }

  append(movements: readonly ChipMovement[]): void {
    this.database.queue.enqueue(() =>
      this.database.sql.transaction(async (tx) => {
        for (const m of movements) await tx.query(INSERT, [m.playerId, m.amount, m.reason, m.matchId]);
      }),
    );
  }
}
