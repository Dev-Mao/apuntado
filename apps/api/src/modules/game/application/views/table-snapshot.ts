import type { LobbyView, SeatView, TableSnapshot } from "@apuntado/contracts";
import type { Room } from "../../domain/room/room.js";
import { MAX_PLAYERS } from "../../domain/round/round.js";
import type { GameSession } from "../../domain/session/game-session.js";
import type { Presence } from "../ports/index.js";
import { projectPlayerView } from "./player-view-projector.js";

export const seatViews = (room: Room, presence: Presence): SeatView[] =>
  room.seats.map((seat) => ({
    playerId: seat.playerId,
    nickname: seat.nickname,
    connected: seat.isBot || presence.isConnected(seat.playerId),
    isBot: seat.isBot,
  }));

export const buildLobbyView = (room: Room, presence: Presence): LobbyView => ({
  code: room.code,
  hostId: room.hostId,
  status: room.status,
  maxSeats: MAX_PLAYERS,
  settings: room.settings,
  seats: seatViews(room, presence),
});

export const buildTableSnapshot = (
  room: Room,
  session: GameSession,
  playerId: string,
  now: Date,
  presence: Presence,
): TableSnapshot => ({
  code: room.code,
  stake: room.settings.stake,
  seats: seatViews(room, presence),
  view: projectPlayerView(session, playerId, now),
});
