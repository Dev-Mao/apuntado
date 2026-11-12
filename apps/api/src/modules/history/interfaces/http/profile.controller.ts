import { Controller, Get, Headers, Inject, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import type { ProfileView } from "@apuntado/contracts";
import type { PlayerIdentity, ProfileReader } from "../../application/ports.js";
import { PLAYER_IDENTITY, PROFILE_READER } from "./tokens.js";

@Controller("api/profile")
export class ProfileController {
  constructor(
    @Inject(PLAYER_IDENTITY) private readonly identity: PlayerIdentity,
    @Inject(PROFILE_READER) private readonly profiles: ProfileReader,
  ) {}

  @Get()
  async show(@Headers("cookie") cookieHeader: string | undefined): Promise<ProfileView> {
    const player = this.identity.resolve(cookieHeader);
    if (!player) throw new UnauthorizedException("No hay una sesión activa");
    const stats = await this.profiles.statsOf(player.id);
    if (!stats) throw new ServiceUnavailableException("El historial no está disponible");
    return { nickname: player.nickname, guest: player.guest, ...stats };
  }
}
