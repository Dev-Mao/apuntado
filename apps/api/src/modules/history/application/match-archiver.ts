import type { MatchFinished, MatchStarted, RoundClosed, RoundStarted } from "../../game/index.js";
import type { EventSubscriber, MatchKind, MatchRecords } from "./ports.js";

const kindOf = (event: MatchStarted): MatchKind =>
  event.seats.filter((seat) => !seat.isBot).length > 1 ? "SALA_PRIVADA" : "VS_MAQUINA";

export class MatchArchiver {
  constructor(private readonly records: MatchRecords) {}

  listenTo(events: EventSubscriber): void {
    const on = <E>(name: string, handler: (event: E) => void): void =>
      events.subscribe(name, (payload) => handler(payload as unknown as E));
    on<MatchStarted>("PartidaIniciada", (event) => this.matchStarted(event));
    on<RoundStarted>("RondaIniciada", (event) => this.roundStarted(event));
    on<RoundClosed>("RondaCerrada", (event) => this.roundClosed(event));
    on<MatchFinished>("PartidaFinalizada", (event) => this.matchFinished(event));
  }

  matchStarted(event: MatchStarted): void {
    const { config } = event;
    this.records.openMatch({
      matchId: event.matchId,
      startedAt: event.at,
      kind: kindOf(event),
      threshold: config.eliminationThreshold,
      stake: event.stake,
      rules: { modalidad: config.mode, umbral: config.eliminationThreshold, segundosPorTurno: config.turnSeconds },
      participants: event.seats.map((seat, index) => ({ ...seat, seat: index + 1 })),
    });
  }

  roundStarted(event: RoundStarted): void {
    this.records.openRound({ matchId: event.matchId, roundNumber: event.roundNumber, startedAt: event.at, hands: event.hands });
  }

  roundClosed({ matchId, at, summary, scoreboard }: RoundClosed): void {
    const lines = new Map(scoreboard.map((line) => [line.playerId, line]));
    this.records.settleRound({
      matchId,
      roundNumber: summary.roundNumber,
      closedAt: at,
      winnerId: summary.winnerId,
      closureType: summary.closureType,
      scores: summary.scores.map(({ playerId, points }) => ({
        playerId,
        points,
        total: lines.get(playerId)?.total ?? points,
        eliminated: lines.get(playerId)?.eliminated ?? false,
      })),
    });
  }

  matchFinished(event: MatchFinished): void {
    this.records.closeMatch({ matchId: event.matchId, finishedAt: event.at, winnerId: event.winnerId });
  }
}
