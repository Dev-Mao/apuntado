import type { SessionView } from "@apuntado/contracts";
import type { Response } from "express";
import { SESSION_COOKIE } from "../../application/read-session.js";
import type { Player } from "../../domain/player.js";

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const toView = (player: Player): SessionView => ({
  playerId: player.id,
  nickname: player.nickname,
  guest: player.kind === "INVITADO",
});

export const setSessionCookie = (res: Response, token: string, secure: boolean): void => {
  res.cookie(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure, maxAge: SESSION_MAX_AGE_MS, path: "/" });
};

export const clearSessionCookie = (res: Response, secure: boolean): void => {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", secure, path: "/" });
};
