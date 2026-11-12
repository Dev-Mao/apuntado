import type { SeatView } from "@apuntado/contracts";

export const SEAT_SPOT = {
  BOTTOM: "bottom",
  LEFT: "left",
  TOP: "top",
  RIGHT: "right",
} as const;

export type SeatSpot = (typeof SEAT_SPOT)[keyof typeof SEAT_SPOT];

const SPOTS_BY_SIZE: Readonly<Record<number, readonly SeatSpot[]>> = {
  2: [SEAT_SPOT.BOTTOM, SEAT_SPOT.TOP],
  3: [SEAT_SPOT.BOTTOM, SEAT_SPOT.LEFT, SEAT_SPOT.RIGHT],
  4: [SEAT_SPOT.BOTTOM, SEAT_SPOT.LEFT, SEAT_SPOT.TOP, SEAT_SPOT.RIGHT],
};

export interface PlacedSeat {
  readonly spot: SeatSpot;
  readonly seat: SeatView | null;
}

export function placeSeats(seats: readonly SeatView[], selfId: string, maxSeats: number): PlacedSeat[] {
  const selfIndex = Math.max(
    seats.findIndex((seat) => seat.playerId === selfId),
    0,
  );
  const ordered = [...seats.slice(selfIndex), ...seats.slice(0, selfIndex)];
  const spots = SPOTS_BY_SIZE[maxSeats] ?? SPOTS_BY_SIZE[4] ?? [];
  return spots.map((spot, index) => ({ spot, seat: ordered[index] ?? null }));
}
