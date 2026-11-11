import type { StakeGuard } from "../../game/application/ports/index.js";
import { ChipLedger } from "../domain/chip-ledger.js";

export class StakeGuardAdapter implements StakeGuard {
  constructor(private readonly ledger: ChipLedger) {}

  hasSufficientBalance(playerId: string, stake: number): boolean {
    return this.ledger.availableBalance(playerId) >= stake;
  }
}
