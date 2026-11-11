import type { ClientToServerEvents, ServerToClientEvents } from "@apuntado/contracts";
import type { Socket } from "socket.io";
import type { AuthenticatedPlayer, Presence } from "../../application/ports/index.js";

export interface SocketData {
  player: AuthenticatedPlayer;
}

export type TableSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export class SocketRegistry implements Presence {
  private readonly sockets = new Map<string, Set<TableSocket>>();

  add(playerId: string, socket: TableSocket): boolean {
    const current = this.sockets.get(playerId) ?? new Set<TableSocket>();
    current.add(socket);
    this.sockets.set(playerId, current);
    return current.size === 1;
  }

  remove(playerId: string, socket: TableSocket): boolean {
    const current = this.sockets.get(playerId);
    if (!current) return false;
    current.delete(socket);
    if (current.size > 0) return false;
    this.sockets.delete(playerId);
    return true;
  }

  socketsOf(playerId: string): readonly TableSocket[] {
    return [...(this.sockets.get(playerId) ?? [])];
  }

  isConnected(playerId: string): boolean {
    return this.sockets.has(playerId);
  }
}
