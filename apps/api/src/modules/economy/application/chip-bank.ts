import type { WalletView } from "@apuntado/contracts";
import type { MatchFinished, MatchStarted } from "../../game/index.js";
import {
  type ChipLedger,
  type ChipMovement,
  type StakeHold,
  WELCOME_BONUS,
  holdMovements,
  refundMovements,
  settlementMovements,
} from "../domain/chip-ledger.js";
import type { EventSubscriber, MovementStore } from "./ports.js";

export type HoldResult = { readonly ok: true } | { readonly ok: false; readonly reason: string };

const RECENT_MOVEMENTS = 20;

export class ChipBank {
  private readonly holds = new Map<string, StakeHold>();
  private readonly unsaved = new Map<string, ChipMovement[]>();

  constructor(
    private readonly ledger: ChipLedger,
    private readonly store: MovementStore,
  ) {}

  async open(): Promise<void> {
    for (const [playerId, balance] of await this.store.balances()) this.ledger.seed(playerId, balance);
    for (const hold of await this.store.unsettledHolds()) this.record(refundMovements(hold));
  }

  listenTo(events: EventSubscriber): void {
    events.subscribe("JugadorRegistrado", (payload) => this.grantWelcomeBonus(String(payload["playerId"])));
    events.subscribe("PartidaIniciada", (payload) => this.matchStarted(payload as unknown as MatchStarted));
    events.subscribe("PartidaFinalizada", (payload) => this.matchFinished(payload as unknown as MatchFinished));
  }

  grantWelcomeBonus(playerId: string): void {
    this.record([{ playerId, amount: WELCOME_BONUS, reason: "BONO_BIENVENIDA", matchId: null }]);
  }

  canCover(playerId: string, stake: number): boolean {
    return this.ledger.canCover(playerId, stake);
  }

  hold(matchId: string, playerIds: readonly string[], stake: number): HoldResult {
    const hold = { matchId, playerIds: [...playerIds], stake };
    const movements = holdMovements(hold);
    if (!this.ledger.apply(movements)) return { ok: false, reason: "Algún jugador ya no tiene fichas suficientes para la apuesta" };
    this.holds.set(matchId, hold);
    this.unsaved.set(matchId, movements);
    return { ok: true };
  }

  matchStarted({ matchId }: Pick<MatchStarted, "matchId">): void {
    const movements = this.unsaved.get(matchId);
    if (!movements) return;
    this.unsaved.delete(matchId);
    this.store.append(movements);
  }

  matchFinished({ matchId, winnerId }: Pick<MatchFinished, "matchId" | "winnerId">): void {
    const hold = this.holds.get(matchId);
    if (!hold) return;
    this.holds.delete(matchId);
    this.record(settlementMovements(hold, winnerId));
  }

  async walletOf(playerId: string): Promise<WalletView> {
    return { balance: this.ledger.balanceOf(playerId), movements: await this.store.recent(playerId, RECENT_MOVEMENTS) };
  }

  private record(movements: readonly ChipMovement[]): void {
    if (this.ledger.apply(movements)) this.store.append(movements);
  }
}
