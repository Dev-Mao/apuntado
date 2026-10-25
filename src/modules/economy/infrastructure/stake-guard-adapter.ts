import type { StakeGuard } from "../../game/application/ports/index.js";
import { ChipLedger } from "../domain/chip-ledger.js";

/**
 * Inversión de dependencias (ADR-01): la interfaz StakeGuard la DECLARA el módulo Juego
 * y la IMPLEMENTA Economía. En el código la flecha apunta de Economía hacia Juego;
 * en ejecución es Juego quien consulta a Economía.
 */
export class StakeGuardAdapter implements StakeGuard {
  constructor(private readonly ledger: ChipLedger) {}

  hasSufficientBalance(playerId: string, stake: number): boolean {
    return this.ledger.availableBalance(playerId) >= stake;
  }
}
