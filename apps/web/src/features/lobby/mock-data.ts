import { DEFAULT_TABLE_SETTINGS } from "@/lib";

import type { LobbyView } from "./types";

export const MOCK_LOBBY: LobbyView = {
  code: "K7Q2",
  selfId: "p1",
  maxPlayers: 4,
  players: [
    { id: "p1", name: "Mariana", isHost: true, isConnected: true },
    { id: "p2", name: "Andrés", isHost: false, isConnected: true },
    { id: "p3", name: "Valentina", isHost: false, isConnected: false },
  ],
  settings: DEFAULT_TABLE_SETTINGS,
  canStart: true,
};
