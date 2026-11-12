export type MovementReason = "BONO_BIENVENIDA" | "APUESTA_RETENIDA" | "BOTE_GANADO" | "APUESTA_DEVUELTA" | "RECARGA";

export const WELCOME_BONUS = 1000;

export interface ChipMovement {
  readonly playerId: string;
  readonly amount: number;
  readonly reason: MovementReason;
  readonly matchId: string | null;
}

export interface StakeHold {
  readonly matchId: string;
  readonly playerIds: readonly string[];
  readonly stake: number;
}

export const holdMovements = ({ matchId, playerIds, stake }: StakeHold): ChipMovement[] =>
  playerIds.map((playerId) => ({ playerId, amount: -stake, reason: "APUESTA_RETENIDA", matchId }));

export const refundMovements = ({ matchId, playerIds, stake }: StakeHold): ChipMovement[] =>
  playerIds.map((playerId) => ({ playerId, amount: stake, reason: "APUESTA_DEVUELTA", matchId }));

export const settlementMovements = (hold: StakeHold, winnerId: string): ChipMovement[] =>
  hold.playerIds.includes(winnerId)
    ? [{ playerId: winnerId, amount: hold.stake * hold.playerIds.length, reason: "BOTE_GANADO", matchId: hold.matchId }]
    : refundMovements(hold);

export class ChipLedger {
  private readonly balances = new Map<string, number>();

  seed(playerId: string, balance: number): void {
    this.balances.set(playerId, balance);
  }

  balanceOf(playerId: string): number {
    return this.balances.get(playerId) ?? 0;
  }

  canCover(playerId: string, amount: number): boolean {
    return this.balanceOf(playerId) >= amount;
  }

  apply(movements: readonly ChipMovement[]): boolean {
    const next = new Map<string, number>();
    for (const { playerId, amount } of movements) next.set(playerId, (next.get(playerId) ?? this.balanceOf(playerId)) + amount);
    if ([...next.values()].some((balance) => balance < 0)) return false;
    for (const [playerId, balance] of next) this.balances.set(playerId, balance);
    return true;
  }
}
