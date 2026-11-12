import type { GameMode, ProfileMatch, ProfileStats } from "@apuntado/contracts";
import type { SqlExecutor } from "../../../shared/database/sql-client.js";
import type { ProfileReader } from "../application/ports.js";

const RECENT_LIMIT = 10;

const MATCH_TOTALS = `
SELECT
  COUNT(*)::int AS played,
  COUNT(*) FILTER (WHERE pa.ganador_id = $1)::int AS won
FROM participacion p
JOIN partida pa ON pa.id = p.partida_id
WHERE p.jugador_id = $1 AND pa.estado = 'FINALIZADA'`;

const ROUND_TOTALS = `
SELECT
  COUNT(*)::int AS rounds_won,
  COUNT(*) FILTER (WHERE r.tipo_cierre = 'APUNTADO')::int AS apuntado_closures
FROM ronda r
JOIN participacion p ON p.id = r.ganador_participacion_id
JOIN partida pa ON pa.id = r.partida_id
WHERE p.jugador_id = $1 AND pa.estado = 'FINALIZADA'`;

const RECENT_MATCHES = `
SELECT
  pa.id AS match_id,
  pa.finalizada_en AS finished_at,
  pa.config_reglas ->> 'modalidad' AS mode,
  COALESCE(pa.ganador_id = $1, false) AS won,
  COALESCE(m.puntos_acumulados, 0)::int AS points,
  (SELECT COUNT(*) FROM ronda r WHERE r.partida_id = pa.id)::int AS rounds,
  ARRAY(
    SELECT COALESCE(j.apodo, o.apodo_invitado)
    FROM participacion o
    LEFT JOIN jugador j ON j.id = o.jugador_id
    WHERE o.partida_id = pa.id AND o.id <> p.id
    ORDER BY o.posicion
  ) AS rivals
FROM participacion p
JOIN partida pa ON pa.id = p.partida_id
LEFT JOIN marcador_partida m ON m.participacion_id = p.id
WHERE p.jugador_id = $1 AND pa.estado = 'FINALIZADA'
ORDER BY pa.finalizada_en DESC
LIMIT ${RECENT_LIMIT}`;

interface MatchTotalsRow {
  readonly played: number;
  readonly won: number;
}

interface RoundTotalsRow {
  readonly rounds_won: number;
  readonly apuntado_closures: number;
}

interface RecentRow {
  readonly match_id: string;
  readonly finished_at: Date;
  readonly mode: GameMode;
  readonly won: boolean;
  readonly points: number;
  readonly rounds: number;
  readonly rivals: string[];
}

const toMatch = (row: RecentRow): ProfileMatch => ({
  matchId: row.match_id,
  finishedAt: new Date(row.finished_at).toISOString(),
  mode: row.mode,
  won: row.won,
  points: row.points,
  rounds: row.rounds,
  rivals: row.rivals,
});

export class PgProfileReader implements ProfileReader {
  constructor(private readonly sql: SqlExecutor) {}

  async statsOf(playerId: string): Promise<ProfileStats> {
    const [[matches], [rounds], recent] = await Promise.all([
      this.sql.query<MatchTotalsRow>(MATCH_TOTALS, [playerId]),
      this.sql.query<RoundTotalsRow>(ROUND_TOTALS, [playerId]),
      this.sql.query<RecentRow>(RECENT_MATCHES, [playerId]),
    ]);
    return {
      played: matches?.played ?? 0,
      won: matches?.won ?? 0,
      roundsWon: rounds?.rounds_won ?? 0,
      apuntadoClosures: rounds?.apuntado_closures ?? 0,
      recent: recent.map(toMatch),
    };
  }
}
