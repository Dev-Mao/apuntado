import type { WalletMovement } from "@apuntado/contracts";
import type { MovementStore } from "../application/ports.js";
import type { ChipMovement, StakeHold } from "../domain/chip-ledger.js";

export class InMemoryMovementStore implements MovementStore {
  private readonly log: { readonly movement: ChipMovement; readonly at: Date }[] = [];

  async balances(): Promise<ReadonlyMap<string, number>> {
    const totals = new Map<string, number>();
    for (const { movement } of this.log) totals.set(movement.playerId, (totals.get(movement.playerId) ?? 0) + movement.amount);
    return totals;
  }

  async unsettledHolds(): Promise<readonly StakeHold[]> {
    return [];
  }

  async recent(playerId: string, limit: number): Promise<readonly WalletMovement[]> {
    return this.log
      .filter(({ movement }) => movement.playerId === playerId)
      .slice(-limit)
      .reverse()
      .map(({ movement, at }) => ({ amount: movement.amount, reason: movement.reason, matchId: movement.matchId, at: at.toISOString() }));
  }

  append(movements: readonly ChipMovement[]): void {
    for (const movement of movements) this.log.push({ movement, at: new Date() });
  }
}
