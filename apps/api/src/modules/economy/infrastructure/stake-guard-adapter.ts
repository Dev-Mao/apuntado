import type { StakeGuard } from "../../game/index.js";
import type { ChipBank, HoldResult } from "../application/chip-bank.js";

export class StakeGuardAdapter implements StakeGuard {
  constructor(private readonly bank: ChipBank) {}

  canCover(playerId: string, stake: number): boolean {
    return this.bank.canCover(playerId, stake);
  }

  hold(matchId: string, playerIds: readonly string[], stake: number): HoldResult {
    return this.bank.hold(matchId, playerIds, stake);
  }
}
