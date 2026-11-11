import type { ClosureDraft, ClosureResponse } from "@/features/closure";
import type { CardDto, ClosureType, GameMode } from "@apuntado/contracts";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";

export const TURN_PHASE = {
  DRAW: "DRAW",
  DISCARD: "DISCARD",
} as const;

export type TurnPhase = (typeof TURN_PHASE)[keyof typeof TURN_PHASE];

export const PLAYER_ACTION = {
  DRAW_STOCK: "DRAW_STOCK",
  TAKE_DISCARD: "TAKE_DISCARD",
  DISCARD: "DISCARD",
  DECLARE_CLOSURE: "DECLARE_CLOSURE",
} as const;

export type PlayerAction = (typeof PLAYER_ACTION)[keyof typeof PLAYER_ACTION];

export interface OpponentView {
  readonly id: string;
  readonly name: string;
  readonly cardCount: number;
  readonly isConnected: boolean;
}

export interface ScoreEntry {
  readonly playerId: string;
  readonly name: string;
  readonly points: number;
  readonly isEliminated: boolean;
}

export interface TurnView {
  readonly playerId: string;
  readonly phase: TurnPhase;
  readonly secondsLeft: number;
}

export interface TableView {
  readonly code: string;
  readonly round: number;
  readonly mode: GameMode;
  readonly eliminationThreshold: number;
  readonly selfId: string;
  readonly selfName: string;
  readonly hand: readonly CardDto[];
  readonly opponents: readonly OpponentView[];
  readonly stockCount: number;
  readonly discardTop: CardDto | null;
  readonly scoreboard: readonly ScoreEntry[];
  readonly turn: TurnView;
  readonly allowedActions: readonly PlayerAction[];
  readonly allowedClosureTypes: readonly ClosureType[];
}

export interface TableActions {
  onDrawFromStock: () => void;
  onTakeFromDiscard: () => void;
  onDiscard: (card: CardDto) => void;
  onSubmitClosure: (draft: ClosureDraft) => Promise<ClosureResponse>;
}

export interface TableScreenProps extends TableActions {
  view: TableView;
}

export interface DragState {
  readonly index: number;
  readonly startX: number;
  readonly startY: number;
  active: boolean;
}

export interface HandCardProps {
  card: CardDto;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  fanStyle: CSSProperties;
  onToggle: (id: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => void;
}

export interface PlayerHandProps {
  cards: readonly CardDto[];
  selectedIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onSortByRank: () => void;
  onSortBySuit: () => void;
}

export interface TurnActionsProps {
  allowedActions: readonly PlayerAction[];
  canDiscard: boolean;
  onDrawFromStock: () => void;
  onTakeFromDiscard: () => void;
  onDiscard: () => void;
  onDeclareClosure: () => void;
}
