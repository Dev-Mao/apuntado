import type { WalletMovement } from "@apuntado/contracts";
import type { ChipMovement, StakeHold } from "../domain/chip-ledger.js";

export interface MovementStore {
  balances(): Promise<ReadonlyMap<string, number>>;
  unsettledHolds(): Promise<readonly StakeHold[]>;
  recent(playerId: string, limit: number): Promise<readonly WalletMovement[]>;
  append(movements: readonly ChipMovement[]): void;
}

export interface EventSubscriber {
  subscribe(eventName: string, handler: (payload: Record<string, unknown>) => void): void;
}

export interface WalletOwner {
  readonly id: string;
  readonly guest: boolean;
}

export interface PlayerIdentity {
  resolve(cookieHeader: string | undefined): WalletOwner | null;
}
