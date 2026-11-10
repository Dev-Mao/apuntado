/** Módulo Identidad: registro, sesión e invitados. Casi no cambia. */
export type PlayerKind = "REGISTRADO" | "INVITADO";

export interface Player {
  readonly id: string;
  readonly nickname: string;
  readonly kind: PlayerKind;
}

/** Los invitados no participan en partidas con apuesta ni acumulan historial (RN-09). */
export const canPlaceStakes = (player: Player): boolean => player.kind === "REGISTRADO";
