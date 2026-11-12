import type { Seat } from "../domain/room/room.types.js";
import type { GameEvent, SessionConfig, SessionIds } from "../domain/session/game-session.types.js";

export interface MatchStarted extends SessionIds {
  readonly name: "PartidaIniciada";
  readonly at: Date;
  readonly config: SessionConfig;
  readonly stake: number;
  readonly seats: readonly Seat[];
}

export type TableEvent = MatchStarted | GameEvent;
