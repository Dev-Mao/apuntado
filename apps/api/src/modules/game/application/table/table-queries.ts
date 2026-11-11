import type { LobbyView, TableSnapshot } from "@apuntado/contracts";
import type { Clock } from "../../../../shared/clock.js";
import type { GameRepository, Presence, RoomRepository } from "../ports/index.js";
import { buildLobbyView, buildTableSnapshot } from "../views/table-snapshot.js";

export class TableQueries {
  constructor(
    private readonly rooms: RoomRepository,
    private readonly games: GameRepository,
    private readonly presence: Presence,
    private readonly clock: Clock,
  ) {}

  activeRoomOf(playerId: string): string | null {
    return this.rooms.findActiveByPlayer(playerId)?.code ?? null;
  }

  playersOf(code: string): string[] {
    return this.rooms.find(code)?.humanIds ?? [];
  }

  lobby(code: string): LobbyView | null {
    const room = this.rooms.find(code);
    return room ? buildLobbyView(room, this.presence) : null;
  }

  snapshot(code: string, playerId: string): TableSnapshot | null {
    const room = this.rooms.find(code);
    const session = this.games.find(code);
    if (!room || !session || !room.hasPlayer(playerId)) return null;
    return buildTableSnapshot(room, session, playerId, this.clock.now(), this.presence);
  }
}
