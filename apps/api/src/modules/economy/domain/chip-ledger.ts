/**
 * LibroDeFichas — registro inmutable de movimientos. El saldo es el resultado de
 * sumarlos, no un número que se sobrescribe: así es auditable y reconstruible.
 */
export type MovementReason = "BONO_BIENVENIDA" | "APUESTA_RETENIDA" | "BOTE_GANADO" | "RECARGA";

export interface ChipMovement {
  readonly playerId: string;
  readonly amount: number;
  readonly reason: MovementReason;
  readonly gameId: string | null;
}

export class ChipLedger {
  private readonly movements: ChipMovement[] = [];

  record(movement: ChipMovement): void {
    this.movements.push(movement);
  }

  availableBalance(playerId: string): number {
    return this.movements
      .filter((m) => m.playerId === playerId)
      .reduce((total, m) => total + m.amount, 0);
  }
}
