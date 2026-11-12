export type Suit = "H" | "D" | "C" | "S";

export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface CardDto {
  readonly rank: Rank;
  readonly suit: Suit;
}

export type GameMode = "CLASICA" | "APUNTADO" | "AMBAS";

export type ClosureType = "CLASICO" | "APUNTADO";

export type TurnPhase = "DRAW" | "DISCARD";

export type GameStatus = "PLAYING" | "ROUND_OVER" | "FINISHED";

export type PlayerAction = "DRAW_STOCK" | "DRAW_DISCARD" | "DISCARD" | "DECLARE_CLOSURE";

export interface OpponentView {
  readonly playerId: string;
  readonly cardCount: number;
}

export interface ScoreLineView {
  readonly playerId: string;
  readonly total: number;
  readonly eliminated: boolean;
}

export interface RoundResultView {
  readonly roundNumber: number;
  readonly roundWinnerId: string | null;
  readonly closureType: ClosureType | null;
  readonly scores: readonly { readonly playerId: string; readonly points: number }[];
}

export interface PlayerView {
  readonly gameId: string;
  readonly mode: GameMode;
  readonly eliminationThreshold: number;
  readonly enabledClosures: readonly ClosureType[];
  readonly status: GameStatus;
  readonly roundNumber: number;
  readonly playerId: string;
  readonly hand: readonly CardDto[];
  readonly cannotDiscard: CardDto | null;
  readonly allowedActions: readonly PlayerAction[];
  readonly opponents: readonly OpponentView[];
  readonly stockSize: number;
  readonly discardTop: CardDto | null;
  readonly currentPlayerId: string | null;
  readonly phase: TurnPhase | null;
  readonly turnDeadline: string | null;
  readonly serverTime: string;
  readonly scoreboard: readonly ScoreLineView[];
  readonly lastRound: RoundResultView | null;
  readonly winnerId: string | null;
}

export interface ClosureDeclarationDto {
  readonly type: ClosureType;
  readonly melds: readonly (readonly CardDto[])[];
  readonly leftovers: readonly CardDto[];
  readonly discard: CardDto | null;
}

export type ActionResult = { readonly ok: true } | { readonly ok: false; readonly reason: string };

export interface SeatView {
  readonly playerId: string;
  readonly nickname: string;
  readonly connected: boolean;
  readonly isBot: boolean;
}

export interface TableSnapshot {
  readonly code: string;
  readonly seats: readonly SeatView[];
  readonly view: PlayerView;
}

export interface SessionView {
  readonly playerId: string;
  readonly nickname: string;
  readonly guest: boolean;
}

export interface SessionState {
  readonly session: SessionView | null;
}

export interface ProfileMatch {
  readonly matchId: string;
  readonly finishedAt: string;
  readonly mode: GameMode;
  readonly won: boolean;
  readonly points: number;
  readonly rounds: number;
  readonly rivals: readonly string[];
}

export interface ProfileStats {
  readonly played: number;
  readonly won: number;
  readonly roundsWon: number;
  readonly apuntadoClosures: number;
  readonly recent: readonly ProfileMatch[];
}

export interface ProfileView extends ProfileStats {
  readonly nickname: string;
  readonly guest: boolean;
}

export interface RoomSettings {
  readonly mode: GameMode;
  readonly eliminationThreshold: number;
  readonly turnSeconds: number;
  readonly stake: number;
}

export type RoomStatus = "LOBBY" | "PLAYING" | "FINISHED";

export interface LobbyView {
  readonly code: string;
  readonly hostId: string;
  readonly status: RoomStatus;
  readonly maxSeats: number;
  readonly settings: RoomSettings;
  readonly seats: readonly SeatView[];
}

export type RoomResult = { readonly ok: true; readonly code: string } | { readonly ok: false; readonly reason: string };

export type DrawSource = "STOCK" | "DISCARD";

export interface ClientToServerEvents {
  "room:create": (settings: RoomSettings, ack: (result: RoomResult) => void) => void;
  "room:join": (code: string, ack: (result: RoomResult) => void) => void;
  "room:leave": (ack: (result: ActionResult) => void) => void;
  "room:addBot": (ack: (result: ActionResult) => void) => void;
  "room:start": (ack: (result: ActionResult) => void) => void;
  "game:draw": (source: DrawSource, ack: (result: ActionResult) => void) => void;
  "game:discard": (card: CardDto, ack: (result: ActionResult) => void) => void;
  "game:declare": (declaration: ClosureDeclarationDto, ack: (result: ActionResult) => void) => void;
}

export interface ServerToClientEvents {
  "lobby:update": (lobby: LobbyView) => void;
  "table:snapshot": (snapshot: TableSnapshot) => void;
}
