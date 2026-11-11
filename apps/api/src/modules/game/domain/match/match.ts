import type { ClosureType } from "../rules/game-rule.js";
import type { RoundScore } from "../services/round-settler.js";

export type GameMode = "CLASICA" | "APUNTADO" | "AMBAS";

export type MatchStatus = "PLAYING" | "FINISHED";

export interface MatchConfig {
  readonly mode: GameMode;
  readonly eliminationThreshold: number;
}

export const DEFAULT_THRESHOLD = 101;

const CLOSURES: Record<GameMode, readonly ClosureType[]> = {
  CLASICA: ["CLASICO"],
  APUNTADO: ["APUNTADO"],
  AMBAS: ["CLASICO", "APUNTADO"],
};

interface Seat {
  readonly playerId: string;
  total: number;
  roundsWon: number;
  eliminated: boolean;
}

export class Match {
  private status: MatchStatus = "PLAYING";
  private winner: string | null = null;
  private dealer = 0;
  private rounds = 0;

  private constructor(readonly config: MatchConfig, private readonly seats: Seat[]) {}

  static create(playerIds: readonly string[], config: MatchConfig): Match {
    return new Match(config, playerIds.map((playerId) => ({ playerId, total: 0, roundsWon: 0, eliminated: false })));
  }

  get enabledClosures(): readonly ClosureType[] {
    return CLOSURES[this.config.mode];
  }

  get currentStatus(): MatchStatus {
    return this.status;
  }

  get winnerId(): string | null {
    return this.winner;
  }

  get roundsPlayed(): number {
    return this.rounds;
  }

  get playerIds(): string[] {
    return this.seats.map((s) => s.playerId);
  }

  get activePlayerIds(): string[] {
    return this.seats.filter((s) => !s.eliminated).map((s) => s.playerId);
  }

  get firstTurnIndex(): number {
    const active = this.activePlayerIds;
    const nextSeat = this.nextActiveSeat(this.dealer);
    return active.indexOf(this.seats[nextSeat]!.playerId);
  }

  totalOf(playerId: string): number {
    return this.seat(playerId).total;
  }

  isEliminated(playerId: string): boolean {
    return this.seat(playerId).eliminated;
  }

  recordRound(scores: readonly RoundScore[], roundWinnerId: string | null): void {
    if (this.status === "FINISHED") throw new Error("The match is already finished");
    for (const { playerId, points } of scores) this.seat(playerId).total += points;
    if (roundWinnerId) this.seat(roundWinnerId).roundsWon += 1;
    this.rounds += 1;
    if (this.config.mode === "CLASICA") return this.finish(roundWinnerId ?? this.best(this.byPlayers(scores)).playerId);
    this.eliminateAndMaybeFinish(scores);
    if (this.status === "PLAYING") this.dealer = this.nextActiveSeat(this.dealer);
  }

  private eliminateAndMaybeFinish(scores: readonly RoundScore[]): void {
    const contenders = this.byPlayers(scores);
    for (const seat of contenders) {
      if (seat.total >= this.config.eliminationThreshold) seat.eliminated = true;
    }
    const survivors = contenders.filter((s) => !s.eliminated);
    if (survivors.length === 1) this.finish(survivors[0]!.playerId);
    if (survivors.length === 0) this.finish(this.best(contenders).playerId);
  }

  private best(candidates: readonly Seat[]): Seat {
    return [...candidates].sort((a, b) => a.total - b.total || b.roundsWon - a.roundsWon)[0]!;
  }

  private byPlayers(scores: readonly RoundScore[]): Seat[] {
    const ids = new Set(scores.map((s) => s.playerId));
    return this.seats.filter((s) => ids.has(s.playerId));
  }

  private finish(winnerId: string): void {
    this.status = "FINISHED";
    this.winner = winnerId;
  }

  private nextActiveSeat(from: number): number {
    for (let step = 1; step <= this.seats.length; step++) {
      const index = (from + step) % this.seats.length;
      if (!this.seats[index]!.eliminated) return index;
    }
    return from;
  }

  private seat(playerId: string): Seat {
    const found = this.seats.find((s) => s.playerId === playerId);
    if (!found) throw new Error(`Unknown player ${playerId}`);
    return found;
  }
}
