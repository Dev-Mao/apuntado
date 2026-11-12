export const ROUTES = {
  HOME: "/",
  LOBBY: "/sala",
  TABLE: "/mesa",
} as const;

export const ROOM_CODE_PARAM = "codigo";

export type RoomPage = typeof ROUTES.LOBBY | typeof ROUTES.TABLE;

export function roomHref(page: RoomPage, code: string): string {
  return `${page}/?${ROOM_CODE_PARAM}=${encodeURIComponent(code)}`;
}
