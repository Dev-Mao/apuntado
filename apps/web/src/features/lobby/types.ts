import type { LobbyView } from "@apuntado/contracts";

export const MAX_SEATS = 4;

export interface LobbyScreenProps {
  lobby: LobbyView;
  selfId: string;
  notice: string | null;
  onAddBot: () => void;
  onStart: () => void;
  onLeave: () => void;
}
