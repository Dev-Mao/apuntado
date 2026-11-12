import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  type HttpException,
  Inject,
  Post,
  Res,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import type { SessionView } from "@apuntado/contracts";
import { parseCookie } from "cookie";
import type { Response } from "express";
import type { OriginPolicy } from "../../../../shared/origin-policy.js";
import type { AccountProblem, AccountResult } from "../../application/account-result.js";
import type { LogIn } from "../../application/log-in.js";
import { type ReadSession, SESSION_COOKIE } from "../../application/read-session.js";
import type { RegisterAccount } from "../../application/register-account.js";
import { clearSessionCookie, setSessionCookie, toView } from "./session-cookie.js";
import { LOG_IN, ORIGIN_POLICY, READ_SESSION, REGISTER_ACCOUNT, SECURE_COOKIES } from "./tokens.js";

type RequestHeaders = Record<string, string | undefined>;

const PROBLEMS: Record<AccountProblem, new (reason: string) => HttpException> = {
  INVALID: BadRequestException,
  CONFLICT: ConflictException,
  UNAUTHORIZED: UnauthorizedException,
  UNAVAILABLE: ServiceUnavailableException,
};

@Controller("api/session")
export class AccountController {
  constructor(
    @Inject(REGISTER_ACCOUNT) private readonly registerAccount: RegisterAccount,
    @Inject(LOG_IN) private readonly logIn: LogIn,
    @Inject(READ_SESSION) private readonly readSession: ReadSession,
    @Inject(SECURE_COOKIES) private readonly secureCookies: boolean,
    @Inject(ORIGIN_POLICY) private readonly origins: OriginPolicy,
  ) {}

  @Post("register")
  @HttpCode(200)
  async register(@Body() body: unknown, @Headers() headers: RequestHeaders, @Res({ passthrough: true }) res: Response): Promise<SessionView> {
    this.checkOrigin(headers);
    const token = headers["cookie"] ? parseCookie(headers["cookie"])[SESSION_COOKIE] : undefined;
    return this.respond(await this.registerAccount.execute(body, this.readSession.fromToken(token)), res);
  }

  @Post("login")
  @HttpCode(200)
  async login(@Body() body: unknown, @Headers() headers: RequestHeaders, @Res({ passthrough: true }) res: Response): Promise<SessionView> {
    this.checkOrigin(headers);
    return this.respond(await this.logIn.execute(body), res);
  }

  @Post("logout")
  @HttpCode(204)
  logout(@Headers() headers: RequestHeaders, @Res({ passthrough: true }) res: Response): void {
    this.checkOrigin(headers);
    clearSessionCookie(res, this.secureCookies);
  }

  private respond(result: AccountResult, res: Response): SessionView {
    if (!result.ok) throw new PROBLEMS[result.problem](result.reason);
    setSessionCookie(res, result.token, this.secureCookies);
    return toView(result.player);
  }

  private checkOrigin(headers: RequestHeaders): void {
    if (!this.origins.allows(headers["origin"], headers["host"])) throw new ForbiddenException("Origen no permitido");
  }
}
