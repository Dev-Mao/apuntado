import type { Clock } from "../../../../shared/clock.js";
import type { RandomSource } from "../../../../shared/random.js";
import type { Card } from "../entities/card.js";
import { createDeck, shuffle } from "../entities/deck.js";
import { Match } from "../match/match.js";
import { Round } from "../round/round.js";
import { OK, type Outcome, rejected } from "../round/round.types.js";
import { type ClosureDeclaration, type ClosureType, type GameRule, type ValidationResult, invalid } from "../rules/game-rule.js";
import { settleRound } from "../services/round-settler.js";
import type { GameEvent, RoundState, RoundSummary, ScoreLine, SessionConfig, SessionStatus } from "./game-session.types.js";

export interface SessionDependencies {
  readonly random: RandomSource;
  readonly clock: Clock;
  readonly newDeck?: () => Card[];
}

const NO_ROUND_IN_PLAY = "No hay una ronda en juego";

export class GameSession {
  private status: SessionStatus = "PLAYING";
  private roundNumber = 1;
  private summary: RoundSummary | null = null;
  private pending: GameEvent[] = [];
  private turnStartedAt: Date;

  private constructor(
    readonly id: string,
    readonly config: SessionConfig,
    private readonly match: Match,
    private round: Round,
    private readonly deps: Required<SessionDependencies>,
  ) {
    this.turnStartedAt = deps.clock.now();
  }

  static start(id: string, playerIds: readonly string[], config: SessionConfig, deps: SessionDependencies): GameSession {
    const resolved = { newDeck: () => shuffle(createDeck(), deps.random), ...deps };
    const match = Match.create(playerIds, { mode: config.mode, eliminationThreshold: config.eliminationThreshold });
    return new GameSession(id, config, match, GameSession.deal(match, resolved), resolved);
  }

  private static deal(match: Match, deps: Required<SessionDependencies>): Round {
    return Round.start(match.activePlayerIds, deps.newDeck(), match.firstTurnIndex, deps.random);
  }

  get currentStatus(): SessionStatus {
    return this.status;
  }

  get currentRound(): RoundState {
    return this.round;
  }

  get currentRoundNumber(): number {
    return this.roundNumber;
  }

  get lastRound(): RoundSummary | null {
    return this.summary;
  }

  get enabledClosures(): readonly ClosureType[] {
    return this.match.enabledClosures;
  }

  get winnerId(): string | null {
    return this.match.winnerId;
  }

  get turnDeadline(): Date {
    return new Date(this.turnStartedAt.getTime() + this.config.turnSeconds * 1000);
  }

  get scoreboard(): ScoreLine[] {
    return this.match.playerIds.map((playerId) => ({
      playerId,
      total: this.match.totalOf(playerId),
      eliminated: this.match.isEliminated(playerId),
    }));
  }

  isTurnExpired(): boolean {
    return this.status === "PLAYING" && this.deps.clock.now() >= this.turnDeadline;
  }

  drawFromStock(playerId: string): Outcome {
    return this.act(() => this.round.drawFromStock(playerId));
  }

  drawFromDiscard(playerId: string): Outcome {
    return this.act(() => this.round.drawFromDiscard(playerId));
  }

  discard(playerId: string, card: Card): Outcome {
    return this.act(() => this.round.discard(playerId, card));
  }

  timeOut(playerId: string): Outcome {
    return this.act(() => this.round.timeOut(playerId));
  }

  declareClosure(playerId: string, declaration: ClosureDeclaration, rule: GameRule): ValidationResult {
    if (this.status !== "PLAYING") return invalid(NO_ROUND_IN_PLAY);
    if (!this.enabledClosures.includes(declaration.type) || rule.type !== declaration.type) {
      return invalid("La modalidad de cierre no está habilitada");
    }
    const result = this.round.declareClosure(playerId, declaration, rule);
    if (result.valid) this.settle();
    return result;
  }

  startNextRound(): Outcome {
    if (this.status !== "ROUND_OVER") return rejected("La ronda actual no ha terminado");
    this.round = GameSession.deal(this.match, this.deps);
    this.roundNumber += 1;
    this.status = "PLAYING";
    this.turnStartedAt = this.deps.clock.now();
    return OK;
  }

  pullEvents(): GameEvent[] {
    const events = this.pending;
    this.pending = [];
    return events;
  }

  private act(action: () => Outcome): Outcome {
    if (this.status !== "PLAYING") return rejected(NO_ROUND_IN_PLAY);
    const playerBefore = this.round.currentPlayerId;
    const outcome = action();
    if (!outcome.ok) return outcome;
    if (this.round.currentStatus !== "PLAYING") this.settle();
    else if (this.round.currentPlayerId !== playerBefore) this.turnStartedAt = this.deps.clock.now();
    return outcome;
  }

  private settle(): void {
    const scores = settleRound(this.round);
    const winnerId = this.round.result?.winnerId ?? null;
    this.match.recordRound(scores, winnerId);
    this.summary = { roundNumber: this.roundNumber, winnerId, closureType: this.round.result?.type ?? null, scores };
    this.pending.push({ name: "RondaCerrada", gameId: this.id, summary: this.summary });
    if (this.match.currentStatus === "FINISHED") return this.finish();
    this.status = "ROUND_OVER";
  }

  private finish(): void {
    this.status = "FINISHED";
    this.pending.push({ name: "PartidaFinalizada", gameId: this.id, winnerId: this.match.winnerId!, scoreboard: this.scoreboard });
  }
}
