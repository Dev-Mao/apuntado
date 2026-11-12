import type { RoomRepository } from "../../application/ports/index.js";
import type { Room } from "../../domain/room/room.js";

export class InMemoryRoomRepository implements RoomRepository {
  private readonly rooms = new Map<string, Room>();

  find(code: string): Room | null {
    return this.rooms.get(code) ?? null;
  }

  findActiveByPlayer(playerId: string): Room | null {
    return [...this.rooms.values()].find((r) => r.status !== "FINISHED" && r.hasPlayer(playerId)) ?? null;
  }

  findByPlayer(playerId: string): Room | null {
    return this.findActiveByPlayer(playerId) ?? [...this.rooms.values()].find((r) => r.hasPlayer(playerId)) ?? null;
  }

  save(room: Room): void {
    this.rooms.set(room.code, room);
  }

  delete(code: string): void {
    this.rooms.delete(code);
  }
}
