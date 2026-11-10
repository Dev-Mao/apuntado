import type { GameMode } from "@apuntado/contracts";

export interface TableSettings {
  readonly mode: GameMode;
  readonly eliminationThreshold: number;
  readonly turnSeconds: number;
  readonly stake: number;
}

export const GAME_MODES: readonly GameMode[] = ["CLASICA", "APUNTADO", "AMBAS"];

export const DEFAULT_TABLE_SETTINGS: TableSettings = {
  mode: "AMBAS",
  eliminationThreshold: 101,
  turnSeconds: 60,
  stake: 0,
};
