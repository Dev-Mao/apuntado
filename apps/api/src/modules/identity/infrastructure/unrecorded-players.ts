import type { PlayerRegistry } from "../application/ports.js";

export class UnrecordedPlayers implements PlayerRegistry {
  remember(): void {}
}
