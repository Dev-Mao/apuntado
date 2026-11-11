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
  readonly winnerId: string | null;
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
  readonly opponents: readonly OpponentView[];
  readonly stockSize: number;
  readonly discardTop: CardDto | null;
  readonly currentPlayerId: string;
  readonly phase: TurnPhase;
  readonly turnDeadline: string;
  readonly scoreboard: readonly ScoreLineView[];
  readonly lastRound: RoundResultView | null;
  readonly winnerId: string | null;
}
