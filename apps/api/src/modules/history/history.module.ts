import { type DynamicModule, type InjectionToken, Module, type ModuleMetadata } from "@nestjs/common";
import type { Database } from "../../shared/database/database.js";
import { RandomIds } from "../../shared/ids.js";
import { MatchArchiver } from "./application/match-archiver.js";
import type { EventSubscriber, ProfileReader } from "./application/ports.js";
import { PgMatchRecords } from "./infrastructure/pg-match-records.js";
import { PgProfileReader } from "./infrastructure/pg-profile-reader.js";
import { UnavailableProfiles } from "./infrastructure/unavailable-profiles.js";
import { ProfileController } from "./interfaces/http/profile.controller.js";
import { PLAYER_IDENTITY, PROFILE_READER } from "./interfaces/http/tokens.js";

export interface HistoryOptions {
  readonly imports: NonNullable<ModuleMetadata["imports"]>;
  readonly playerIdentity: InjectionToken;
  readonly events: EventSubscriber;
  readonly database: Database | null;
}

const profilesFrom = (database: Database | null): ProfileReader =>
  database ? new PgProfileReader(database.sql) : new UnavailableProfiles();

@Module({})
export class HistoryModule {
  static register(options: HistoryOptions): DynamicModule {
    if (options.database) new MatchArchiver(new PgMatchRecords(options.database, new RandomIds())).listenTo(options.events);
    return {
      module: HistoryModule,
      imports: options.imports,
      controllers: [ProfileController],
      providers: [
        { provide: PROFILE_READER, useValue: profilesFrom(options.database) },
        { provide: PLAYER_IDENTITY, useExisting: options.playerIdentity },
      ],
    };
  }
}
