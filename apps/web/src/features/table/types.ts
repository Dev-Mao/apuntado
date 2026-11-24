import type { ActionResult, CardDto, ClosureDeclarationDto, PlayerAction, TableSnapshot } from "@apuntado/contracts";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";

export interface TableActions {
  onDrawFromStock: () => Promise<ActionResult>;
  onDrawFromDiscard: () => Promise<ActionResult>;
  onDiscard: (card: CardDto) => Promise<ActionResult>;
  onDeclareClosure: (declaration: ClosureDeclarationDto) => Promise<ActionResult>;
}

export interface TableScreenProps extends TableActions {
  snapshot: TableSnapshot;
  pending: boolean;
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
  isLocked: boolean;
  isDragging: boolean;
  group: number | null;
  groupStart: boolean;
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
  lockedId: string | null;
  groups: readonly (readonly string[])[];
  groupOf: ReadonlyMap<string, number>;
  canGroup: boolean;
  onToggle: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onGroup: () => void;
  onUngroup: (index: number) => void;
  onSortByRank: () => void;
  onSortBySuit: () => void;
}

export interface PileAction {
  readonly label: string;
  readonly onPress: () => void;
}

export interface TurnActionsProps {
  layout: "stack" | "row";
  allowedActions: readonly PlayerAction[];
  pending: boolean;
  canDiscard: boolean;
  onFocusLost: () => void;
  onDrawFromStock: () => void;
  onDrawFromDiscard: () => void;
  onDiscard: () => void;
  onDeclareClosure: () => void;
}
