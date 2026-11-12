import { type DynamicModule, Inject, Injectable, type InjectionToken, Module, type ModuleMetadata, type OnModuleInit } from "@nestjs/common";
import type { StakeGuard } from "../game/index.js";
import type { Database } from "../../shared/database/database.js";
import { ChipBank } from "./application/chip-bank.js";
import type { EventSubscriber } from "./application/ports.js";
import { ChipLedger } from "./domain/chip-ledger.js";
import { InMemoryMovementStore } from "./infrastructure/in-memory-movement-store.js";
import { PgMovementStore } from "./infrastructure/pg-movement-store.js";
import { StakeGuardAdapter } from "./infrastructure/stake-guard-adapter.js";
import { WalletController } from "./interfaces/http/wallet.controller.js";
import { CHIP_BANK, PLAYER_IDENTITY } from "./interfaces/http/tokens.js";

export interface Economy {
  readonly bank: ChipBank;
  readonly stakes: StakeGuard;
}

export interface EconomyOptions {
  readonly imports: NonNullable<ModuleMetadata["imports"]>;
  readonly playerIdentity: InjectionToken;
  readonly economy: Economy;
}

export const composeEconomy = (database: Database | null, events: EventSubscriber): Economy => {
  const store = database ? new PgMovementStore(database) : new InMemoryMovementStore();
  const bank = new ChipBank(new ChipLedger(), store);
  bank.listenTo(events);
  return { bank, stakes: new StakeGuardAdapter(bank) };
};

@Injectable()
class LedgerLoader implements OnModuleInit {
  constructor(@Inject(CHIP_BANK) private readonly bank: ChipBank) {}

  onModuleInit(): Promise<void> {
    return this.bank.open();
  }
}

@Module({})
export class EconomyModule {
  static register(options: EconomyOptions): DynamicModule {
    return {
      module: EconomyModule,
      imports: options.imports,
      controllers: [WalletController],
      providers: [
        { provide: CHIP_BANK, useValue: options.economy.bank },
        { provide: PLAYER_IDENTITY, useExisting: options.playerIdentity },
        LedgerLoader,
      ],
    };
  }
}
