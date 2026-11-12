import type { GameCommands, GuestSessionResult } from "@/lib";
import type { LobbyView, SessionView, TableSnapshot } from "@apuntado/contracts";

export type SessionState =
  | { readonly status: "checking" }
  | { readonly status: "none" }
  | { readonly status: "offline" }
  | { readonly status: "ready"; readonly session: SessionView };

export type ConnectionStatus = "idle" | "connecting" | "connected" | "reconnecting" | "failed";

export interface RoomState {
  readonly lobby: LobbyView | null;
  readonly snapshot: TableSnapshot | null;
}

export interface RealtimeContextValue {
  readonly session: SessionState;
  readonly connection: ConnectionStatus;
  readonly connectCount: number;
  readonly room: RoomState;
  readonly entryNotice: string | null;
  readonly leftCode: string | null;
  readonly commands: GameCommands;
  readonly startSession: (nickname: string) => Promise<GuestSessionResult>;
  readonly adoptSession: (view: SessionView) => void;
  readonly endSession: () => Promise<void>;
  readonly receivedSinceConnect: () => boolean;
  readonly clearRoom: () => void;
  readonly setEntryNotice: (notice: string | null) => void;
  readonly setLeftCode: (code: string | null) => void;
}
