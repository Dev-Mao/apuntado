import { io } from "socket.io-client";

import { API_ORIGIN } from "./api";

import type {
  ActionResult,
  CardDto,
  ClientToServerEvents,
  ClosureDeclarationDto,
  DrawSource,
  LobbyView,
  RoomResult,
  RoomSettings,
  ServerToClientEvents,
  TableSnapshot,
} from "@apuntado/contracts";
import type { Socket } from "socket.io-client";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface GameCommands {
  createRoom: (settings: RoomSettings) => Promise<RoomResult>;
  joinRoom: (code: string) => Promise<RoomResult>;
  leaveRoom: () => Promise<ActionResult>;
  addBot: () => Promise<ActionResult>;
  startGame: () => Promise<ActionResult>;
  draw: (source: DrawSource) => Promise<ActionResult>;
  discard: (card: CardDto) => Promise<ActionResult>;
  declare: (declaration: ClosureDeclarationDto) => Promise<ActionResult>;
}

export interface ConnectionListeners {
  onConnect: () => void;
  onLost: () => void;
  onRejected: () => void;
  onLobby: (lobby: LobbyView) => void;
  onSnapshot: (snapshot: TableSnapshot) => void;
}

export interface GameConnection {
  readonly commands: GameCommands;
  open: (listeners: ConnectionListeners) => boolean;
  close: () => void;
}

const ACK_TIMEOUT_MS = 8000;

function createGameSocket(): GameSocket {
  const options = { withCredentials: true, autoConnect: false };
  return API_ORIGIN ? io(API_ORIGIN, options) : io(options);
}

export function createGameConnection(): GameConnection {
  let socket: GameSocket | null = null;

  const timed = () => {
    if (!socket) throw new Error("There is no game socket yet");
    return socket.timeout(ACK_TIMEOUT_MS);
  };

  const close = () => {
    socket?.removeAllListeners();
    socket?.disconnect();
    socket = null;
  };

  const open = (listeners: ConnectionListeners) => {
    if (socket) return false;
    const current = createGameSocket();
    socket = current;
    current.on("connect", listeners.onConnect);
    current.on("disconnect", (reason) => {
      listeners.onLost();
      if (reason === "io server disconnect") current.connect();
    });
    current.on("connect_error", () => {
      if (current.active) return listeners.onLost();
      close();
      listeners.onRejected();
    });
    current.on("lobby:update", listeners.onLobby);
    current.on("table:snapshot", listeners.onSnapshot);
    current.connect();
    return true;
  };

  const commands: GameCommands = {
    createRoom: async (settings) => timed().emitWithAck("room:create", settings),
    joinRoom: async (code) => timed().emitWithAck("room:join", code),
    leaveRoom: async () => timed().emitWithAck("room:leave"),
    addBot: async () => timed().emitWithAck("room:addBot"),
    startGame: async () => timed().emitWithAck("room:start"),
    draw: async (source) => timed().emitWithAck("game:draw", source),
    discard: async (card) => timed().emitWithAck("game:discard", card),
    declare: async (declaration) => timed().emitWithAck("game:declare", declaration),
  };

  return { commands, open, close };
}
