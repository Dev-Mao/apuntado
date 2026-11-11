import type { GameMode } from "../match/match.js";

export interface RoomSettings {
  readonly mode: GameMode;
  readonly eliminationThreshold: number;
  readonly turnSeconds: number;
  readonly stake: number;
}

export interface RoomMember {
  readonly id: string;
  readonly nickname: string;
  readonly guest: boolean;
}

export interface Seat {
  readonly playerId: string;
  readonly nickname: string;
  readonly isBot: boolean;
}

export type RoomStatus = "LOBBY" | "PLAYING" | "FINISHED";
