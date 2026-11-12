import type { Database } from "../../../shared/database/database.js";
import { requireRows, type SqlExecutor } from "../../../shared/database/sql-client.js";
import type {
  IdGenerator,
  MatchClosing,
  MatchOpening,
  MatchRecords,
  Participant,
  RoundOpening,
  RoundSettlement,
} from "../application/ports.js";

type Participations = ReadonlyMap<string, string>;

const INSERT_MATCH = `
INSERT INTO partida (id, modo, estado, umbral_eliminacion, config_reglas, monto_apuesta, iniciada_en)
VALUES ($1, $2, 'EN_CURSO', $3, $4, $5, $6)`;

const ENSURE_PLAYER = "INSERT INTO jugador (id, apodo, tipo) VALUES ($1, $2, 'INVITADO') ON CONFLICT (id) DO NOTHING";
const INSERT_PARTICIPATION = `
INSERT INTO participacion (id, partida_id, jugador_id, apodo_invitado, posicion)
VALUES ($1, $2, $3, $4, $5)`;

const INSERT_ROUND = "INSERT INTO ronda (id, partida_id, numero, iniciada_en) VALUES ($1, $2, $3, $4)";
const INSERT_HAND = "INSERT INTO mano_jugador (id, ronda_id, participacion_id) VALUES ($1, $2, $3)";
const INSERT_HAND_CARDS = `
INSERT INTO mano_carta (mano_id, carta_codigo, posicion)
SELECT $1, t.codigo, t.posicion FROM unnest($2::text[]) WITH ORDINALITY AS t (codigo, posicion)`;

const BUMP_VERSION = "UPDATE partida SET version = version + 1 WHERE id = $1 RETURNING version";
const INSERT_SCORE = `
INSERT INTO puntaje_acumulado (id, participacion_id, ronda_id, puntos_ronda, puntos_acumulados)
SELECT $1, $2, r.id, $3, $4 FROM ronda r WHERE r.partida_id = $5 AND r.numero = $6
RETURNING id`;
const MARK_ELIMINATED = "UPDATE participacion SET eliminado_en_ronda = $2 WHERE id = $1 AND eliminado_en_ronda IS NULL";
const CLOSE_ROUND = `
UPDATE ronda SET cerrada_en = $3, tipo_cierre = $4, ganador_participacion_id = $5
WHERE partida_id = $1 AND numero = $2 AND cerrada_en IS NULL
RETURNING id`;

const CLOSE_MATCH = `
UPDATE partida SET estado = 'FINALIZADA', finalizada_en = $2,
  ganador_id = (SELECT jugador_id FROM participacion WHERE id = $3)
WHERE id = $1
RETURNING id`;

const ensurePlayer = async (tx: SqlExecutor, participant: Participant): Promise<string | null> => {
  if (participant.isBot) return null;
  await tx.query(ENSURE_PLAYER, [participant.playerId, participant.nickname]);
  return participant.playerId;
};

export class PgMatchRecords implements MatchRecords {
  private readonly participations = new Map<string, Participations>();

  constructor(
    private readonly database: Database,
    private readonly ids: IdGenerator,
  ) {}

  openMatch(opening: MatchOpening): void {
    const byPlayer = new Map(opening.participants.map((p) => [p.playerId, this.ids.next()]));
    this.participations.set(opening.matchId, byPlayer);
    this.write(async (tx) => {
      const { matchId, kind, threshold, stake, rules, startedAt } = opening;
      await tx.query(INSERT_MATCH, [matchId, kind, threshold, JSON.stringify(rules), stake, startedAt]);
      for (const p of opening.participants) {
        const playerId = await ensurePlayer(tx, p);
        await tx.query(INSERT_PARTICIPATION, [byPlayer.get(p.playerId)!, matchId, playerId, p.isBot ? p.nickname : null, p.seat]);
      }
    });
  }

  openRound(opening: RoundOpening): void {
    const byPlayer = this.participations.get(opening.matchId);
    if (!byPlayer) return;
    const roundId = this.ids.next();
    const hands = opening.hands.map((hand) => ({ ...hand, handId: this.ids.next(), participationId: byPlayer.get(hand.playerId) }));
    this.write(async (tx) => {
      await tx.query(INSERT_ROUND, [roundId, opening.matchId, opening.roundNumber, opening.startedAt]);
      for (const hand of hands) {
        if (!hand.participationId) continue;
        await tx.query(INSERT_HAND, [hand.handId, roundId, hand.participationId]);
        await tx.query(INSERT_HAND_CARDS, [hand.handId, hand.cards]);
      }
    });
  }

  settleRound(settlement: RoundSettlement): void {
    const byPlayer = this.participations.get(settlement.matchId);
    if (!byPlayer) return;
    const { matchId, roundNumber, closedAt, closureType, winnerId } = settlement;
    const winner = winnerId ? (byPlayer.get(winnerId) ?? null) : null;
    const scores = settlement.scores.flatMap((score) => {
      const participationId = byPlayer.get(score.playerId);
      return participationId ? [{ ...score, participationId, scoreId: this.ids.next() }] : [];
    });
    this.write(async (tx) => {
      requireRows(await tx.query(BUMP_VERSION, [matchId]), `match ${matchId}`);
      for (const score of scores) {
        const params = [score.scoreId, score.participationId, score.points, score.total, matchId, roundNumber];
        requireRows(await tx.query(INSERT_SCORE, params), `round ${roundNumber} of match ${matchId}`);
        if (score.eliminated) await tx.query(MARK_ELIMINATED, [score.participationId, roundNumber]);
      }
      requireRows(await tx.query(CLOSE_ROUND, [matchId, roundNumber, closedAt, closureType, winner]), `open round ${roundNumber}`);
    });
  }

  closeMatch(closing: MatchClosing): void {
    const byPlayer = this.participations.get(closing.matchId);
    if (!byPlayer) return;
    this.participations.delete(closing.matchId);
    const winner = byPlayer.get(closing.winnerId) ?? null;
    this.write(async (tx) => {
      requireRows(await tx.query(CLOSE_MATCH, [closing.matchId, closing.finishedAt, winner]), `match ${closing.matchId}`);
    });
  }

  private write(work: (tx: SqlExecutor) => Promise<void>): void {
    this.database.queue.enqueue(() => this.database.sql.transaction(work));
  }
}
