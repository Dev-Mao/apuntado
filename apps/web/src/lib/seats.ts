import type { SeatView } from "@apuntado/contracts";

export function seatOf(seats: readonly SeatView[], playerId: string | null): SeatView | undefined {
  return seats.find((seat) => seat.playerId === playerId);
}

export function nicknameOf(seats: readonly SeatView[], playerId: string | null): string {
  return seatOf(seats, playerId)?.nickname ?? "";
}
