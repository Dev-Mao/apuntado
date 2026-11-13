export type PlayerKind = "REGISTRADO" | "INVITADO";

export interface Player {
  readonly id: string;
  readonly nickname: string;
  readonly kind: PlayerKind;
}
