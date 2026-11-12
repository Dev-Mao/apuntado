import type { LobbyView } from "@apuntado/contracts";

export interface LobbyScreenProps {
  lobby: LobbyView;
  selfId: string;
  notice: string | null;
  onAddBot: () => void;
  onStart: () => void;
  onLeave: () => void;
}
