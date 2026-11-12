export type { MatchStarted } from "./application/events.js";
export type { AuthenticatedPlayer, PlayerIdentity, StakeGuard } from "./application/ports/index.js";
export type { MatchFinished, RoundClosed, RoundStarted } from "./domain/session/game-session.types.js";
export type { TableTiming } from "./application/table/table-coordinator.js";
export { GameModule, type GameModuleOptions } from "./game.module.js";
