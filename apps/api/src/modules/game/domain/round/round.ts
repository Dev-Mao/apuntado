import type { RandomSource } from "../../../../shared/random.js";
import { type Card, cardId, points } from "../entities/card.js";
import { DECK_SIZE, shuffle } from "../entities/deck.js";
import { type ClosureDeclaration, type GameRule, type ValidationResult, invalid } from "../rules/game-rule.js";
import { OK, type Outcome, type RoundClosure, type RoundPhase, type RoundStatus, rejected } from "./round.types.js";

export const HAND_SIZE = 10;
const MAX_RECYCLES = 1;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

interface LastDraw {
  readonly card: Card;
  readonly fromDiscard: boolean;
}

const sameCard = (a: Card, b: Card): boolean => cardId(a) === cardId(b);

const sameCards = (a: readonly Card[], b: readonly Card[]): boolean =>
  a.length === b.length && [...a.map(cardId)].sort().join() === [...b.map(cardId)].sort().join();

const declaredCards = (d: ClosureDeclaration): Card[] => [...d.melds.flat(), ...d.leftovers, ...(d.discard ? [d.discard] : [])];

export class Round {
  private phase: RoundPhase = "DRAW";
  private status: RoundStatus = "PLAYING";
  private closure: RoundClosure | null = null;
  private lastDraw: LastDraw | null = null;
  private recycles = 0;

  private constructor(
    readonly playerIds: readonly string[],
    private readonly hands: Map<string, Card[]>,
    private stock: Card[],
    private discardPile: Card[],
    private turnIndex: number,
    private readonly random: RandomSource,
  ) {}

  static start(playerIds: readonly string[], deck: readonly Card[], firstTurn: number, random: RandomSource): Round {
    if (playerIds.length < MIN_PLAYERS || playerIds.length > MAX_PLAYERS) throw new Error("A round needs 2 to 4 players");
    if (deck.length !== DECK_SIZE) throw new Error("A round needs a full deck");
    const hands = new Map(playerIds.map((id, i) => [id, deck.slice(i * HAND_SIZE, (i + 1) * HAND_SIZE)]));
    const dealt = playerIds.length * HAND_SIZE;
    return new Round(playerIds, hands, deck.slice(dealt + 1), [deck[dealt]!], firstTurn % playerIds.length, random);
  }

  get currentPlayerId(): string {
    return this.playerIds[this.turnIndex]!;
  }

  get currentPhase(): RoundPhase {
    return this.phase;
  }

  get currentStatus(): RoundStatus {
    return this.status;
  }

  get result(): RoundClosure | null {
    return this.closure;
  }

  get stockSize(): number {
    return this.stock.length;
  }

  get discardSize(): number {
    return this.discardPile.length;
  }

  get discardTop(): Card | null {
    return this.discardPile.at(-1) ?? null;
  }

  handOf(playerId: string): readonly Card[] {
    return this.hands.get(playerId) ?? [];
  }

  drawFromStock(playerId: string): Outcome {
    const reason = this.denial(playerId, "DRAW");
    if (reason) return rejected(reason);
    if (this.stock.length === 0 && !this.recycleDiscardPile()) {
      this.status = "EXHAUSTED";
      return OK;
    }
    this.take(this.stock.pop()!, false);
    return OK;
  }

  drawFromDiscard(playerId: string): Outcome {
    const reason = this.denial(playerId, "DRAW");
    if (reason) return rejected(reason);
    this.take(this.discardPile.pop()!, true);
    return OK;
  }

  discard(playerId: string, card: Card): Outcome {
    const reason = this.denial(playerId, "DISCARD") ?? this.discardDenial(card);
    if (reason) return rejected(reason);
    this.removeFromHand(card);
    this.discardPile.push(card);
    this.passTurn();
    return OK;
  }

  declareClosure(playerId: string, declaration: ClosureDeclaration, rule: GameRule): ValidationResult {
    const reason = this.denial(playerId, "DISCARD") ?? (declaration.discard ? this.discardDenial(declaration.discard) : null);
    if (reason) return invalid(reason);
    if (!sameCards(declaredCards(declaration), this.handOf(playerId))) {
      return invalid("Las cartas declaradas no coinciden con su mano");
    }
    const result = rule.validate(declaration);
    if (!result.valid) return result;
    if (declaration.discard) {
      this.removeFromHand(declaration.discard);
      this.discardPile.push(declaration.discard);
    }
    this.status = "CLOSED";
    this.closure = { winnerId: playerId, type: declaration.type };
    return result;
  }

  timeOut(playerId: string): Outcome {
    if (this.phase === "DRAW") {
      const drawn = this.drawFromStock(playerId);
      if (!drawn.ok || this.status !== "PLAYING") return drawn;
    }
    return this.discard(playerId, this.automaticDiscard(playerId));
  }

  private denial(playerId: string, phase: RoundPhase): string | null {
    if (this.status !== "PLAYING") return "La ronda ya terminó";
    if (playerId !== this.currentPlayerId) return "No es su turno";
    if (this.phase === phase) return null;
    return phase === "DRAW" ? "Ya robó una carta en este turno" : "Primero debe robar una carta";
  }

  private discardDenial(card: Card): string | null {
    if (!this.handOf(this.currentPlayerId).some((c) => sameCard(c, card))) return "La carta no está en su mano";
    if (this.lastDraw?.fromDiscard && sameCard(this.lastDraw.card, card)) {
      return "No puede descartar la carta que acaba de tomar del pozo";
    }
    return null;
  }

  private automaticDiscard(playerId: string): Card {
    const last = this.lastDraw!;
    if (!last.fromDiscard) return last.card;
    const candidates = this.handOf(playerId).filter((c) => !sameCard(c, last.card));
    return candidates.reduce((highest, c) => (points(c) > points(highest) ? c : highest));
  }

  private recycleDiscardPile(): boolean {
    if (this.recycles >= MAX_RECYCLES) return false;
    const top = this.discardPile.pop()!;
    this.stock = shuffle(this.discardPile, this.random);
    this.discardPile = [top];
    this.recycles += 1;
    return true;
  }

  private take(card: Card, fromDiscard: boolean): void {
    this.hands.get(this.currentPlayerId)!.push(card);
    this.lastDraw = { card, fromDiscard };
    this.phase = "DISCARD";
  }

  private removeFromHand(card: Card): void {
    const hand = this.hands.get(this.currentPlayerId)!;
    hand.splice(hand.findIndex((c) => sameCard(c, card)), 1);
  }

  private passTurn(): void {
    this.turnIndex = (this.turnIndex + 1) % this.playerIds.length;
    this.phase = "DRAW";
    this.lastDraw = null;
  }
}
