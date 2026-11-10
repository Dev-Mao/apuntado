import type { TableSettings } from "@/lib";

export interface LobbyPlayer {
  readonly id: string;
  readonly name: string;
  readonly isHost: boolean;
  readonly isConnected: boolean;
}

export interface LobbyView {
  readonly code: string;
  readonly selfId: string;
  readonly maxPlayers: number;
  readonly players: readonly LobbyPlayer[];
  readonly settings: TableSettings;
  readonly canStart: boolean;
}

export interface LobbyScreenProps {
  lobby: LobbyView;
  onStart: () => void;
  onLeave: () => void;
}
