import { Controller, ForbiddenException, Get, Headers, Inject, UnauthorizedException } from "@nestjs/common";
import type { WalletView } from "@apuntado/contracts";
import type { ChipBank } from "../../application/chip-bank.js";
import type { PlayerIdentity } from "../../application/ports.js";
import { CHIP_BANK, PLAYER_IDENTITY } from "./tokens.js";

@Controller("api/wallet")
export class WalletController {
  constructor(
    @Inject(PLAYER_IDENTITY) private readonly identity: PlayerIdentity,
    @Inject(CHIP_BANK) private readonly bank: ChipBank,
  ) {}

  @Get()
  show(@Headers("cookie") cookieHeader: string | undefined): Promise<WalletView> {
    const player = this.identity.resolve(cookieHeader);
    if (!player) throw new UnauthorizedException("No hay una sesión activa");
    if (player.guest) throw new ForbiddenException("Los invitados no tienen fichas");
    return this.bank.walletOf(player.id);
  }
}
