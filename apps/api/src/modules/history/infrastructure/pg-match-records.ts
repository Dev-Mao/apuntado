import type { Database } from "../../../shared/database/database.js";
import type { SqlExecutor } from "../../../shared/database/sql-client.js";
import type { MatchClosing, MatchOpening, MatchRecords, Participant, RoundOpening, RoundSettlement } from "../application/ports.js";

interface IdSource {
  next(): string;
}

type Participations = ReadonlyMap<string, string>;

const INSERT_MATCH = `
INSERT INTO partida (id, modo, estado, umbral_eliminacion, config_reglas, monto_apuesta, iniciada_en)
VALUES ($1, $2, 'EN_CURSO', $3, $4, $5, $6)`;

const INSERT_PARTICIPATION = `
INSERT INTO participacion (id, partida_id, jugador_id, apodo_invitado, posicion)
SELECT $1, $2, j.id, CASE WHEN j.id IS NULL THEN $4 END, $5
FROM (SELECT $3::uuid AS candidato) c
LEFT JOIN jugador j ON j.id = c.candidato`;

const INSERT_ROUND = "INSERT INTO ronda (id, partida_id, numero, iniciada_en) VALUES ($1, $2, $3, $4)";
const INSERT_HAND = "INSERT INTO mano_jugador (id, ronda_id, participacion_id) VALUES ($1, $2, $3)";
const INSERT_HAND_CARDS = `
INSERT INTO mano_carta (mano_id, carta_codigo, posicion)
SELECT $1, t.codigo, t.posicion FROM unnest($2::text[]) WITH ORDINALITY AS t (codigo, posicion)`;

const BUMP_VERSION = "UPDATE partida SET version = version + 1 WHERE id = $1";
const INSERT_SCORE = `
INSERT INTO puntaje_acumulado (id, participacion_id, ronda_id, puntos_ronda, puntos_acumulados)
SELECT $1, $2, r.id, $3, $4 FROM ronda r WHERE r.partida_id = $5 AND r.numero = $6`;
const MARK_ELIMINATED = "UPDATE participacion SET eliminado_en_ronda = $2 WHERE id = $1 AND eliminado_en_ronda IS NULL";
const CLOSE_ROUND = `
UPDATE ronda SET cerrada_en = $3, tipo_cierre = $4, ganador_participacion_id = $5
WHERE partida_id = $1 AND numero = $2 AND cerrada_en IS NULL`;

const CLOSE_MATCH = `
UPDATE partida SET estado = 'FINALIZADA', finalizada_en = $2,
  ganador_id = (SELECT jugador_id FROM participacion WHERE id = $3)
WHERE id = $1`;

const candidateId = (participant: Participant): string | null => (participant.isBot ? null : participant.playerId);

export class PgMatchRecords implements MatchRecords {
  private readonly participations = new Map<string, Participations>();

  constructor(
    private readonly database: Database,
    private readonly ids: IdSource,
  ) {}

  openMatch(opening: MatchOpening): void {
    const byPlayer = new Map(opening.participants.map((p) => [p.playerId, this.ids.next()]));
    this.participations.set(opening.matchId, byPlayer);
    this.write(async (tx) => {
      const { matchId, kind, threshold, stake, rules, startedAt } = opening;
      await tx.query(INSERT_MATCH, [matchId, kind, threshold, JSON.stringify(rules), stake, startedAt]);
      for (const p of opening.participants) {
        await tx.query(INSERT_PARTICIPATION, [byPlayer.get(p.playerId)!, matchId, candidateId(p), p.nickname, p.seat]);
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
      await tx.query(BUMP_VERSION, [matchId]);
      for (const score of scores) {
        await tx.query(INSERT_SCORE, [score.scoreId, score.participationId, score.points, score.total, matchId, roundNumber]);
        if (score.eliminated) await tx.query(MARK_ELIMINATED, [score.participationId, roundNumber]);
      }
      await tx.query(CLOSE_ROUND, [matchId, roundNumber, closedAt, closureType, winner]);
    });
  }

  closeMatch(closing: MatchClosing): void {
    const byPlayer = this.participations.get(closing.matchId);
    if (!byPlayer) return;
    this.participations.delete(closing.matchId);
    const winner = byPlayer.get(closing.winnerId) ?? null;
    this.write(async (tx) => {
      await tx.query(CLOSE_MATCH, [closing.matchId, closing.finishedAt, winner]);
    });
  }

  private write(work: (tx: SqlExecutor) => Promise<void>): void {
    this.database.queue.enqueue(() => this.database.sql.transaction(work));
  }
}
