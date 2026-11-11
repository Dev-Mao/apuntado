import { BadRequestException, Body, Controller, Get, Headers, HttpCode, Inject, Post, Res, UnauthorizedException } from "@nestjs/common";
import type { SessionView } from "@apuntado/contracts";
import { parseCookie } from "cookie";
import type { Response } from "express";
import { type ReadSession, SESSION_COOKIE } from "../../application/read-session.js";
import type { StartGuestSession } from "../../application/start-guest-session.js";
import type { Player } from "../../domain/player.js";
import { READ_SESSION, SECURE_COOKIES, START_GUEST_SESSION } from "./tokens.js";

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const toView = (player: Player): SessionView => ({
  playerId: player.id,
  nickname: player.nickname,
  guest: player.kind === "INVITADO",
});

@Controller("api/session")
export class SessionController {
  constructor(
    @Inject(START_GUEST_SESSION) private readonly startGuest: StartGuestSession,
    @Inject(READ_SESSION) private readonly readSession: ReadSession,
    @Inject(SECURE_COOKIES) private readonly secureCookies: boolean,
  ) {}

  @Post("guest")
  @HttpCode(200)
  guest(@Body() body: unknown, @Res({ passthrough: true }) res: Response): SessionView {
    const nickname = typeof body === "object" && body !== null ? (body as Record<string, unknown>)["nickname"] : undefined;
    const result = this.startGuest.execute(nickname);
    if (!result.ok) throw new BadRequestException(result.reason);
    res.cookie(SESSION_COOKIE, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: this.secureCookies,
      maxAge: SESSION_MAX_AGE_MS,
      path: "/",
    });
    return toView(result.player);
  }

  @Get()
  current(@Headers("cookie") cookieHeader: string | undefined): SessionView {
    const token = cookieHeader ? parseCookie(cookieHeader)[SESSION_COOKIE] : undefined;
    const player = this.readSession.fromToken(token);
    if (!player) throw new UnauthorizedException("No hay una sesión activa");
    return toView(player);
  }
}
