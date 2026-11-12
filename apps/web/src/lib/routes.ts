export const ROUTES = {
  HOME: "/",
  LOBBY: "/sala",
  TABLE: "/mesa",
  ROUND_RESULTS: "/resultados",
  GAME_RESULTS: "/resultados/final",
} as const;

export const ROOM_CODE_PARAM = "codigo";

export type RoomPage = typeof ROUTES.LOBBY | typeof ROUTES.TABLE;

export function roomHref(page: RoomPage, code: string): string {
  return `${page}/?${ROOM_CODE_PARAM}=${encodeURIComponent(code)}`;
}
