import type { ActionResult, CardDto, ClosureDeclarationDto, ClosureType } from "@apuntado/contracts";
import type { ReactNode } from "react";

export const CLOSURE_SLOT = {
  GROUP_1: "GROUP_1",
  GROUP_2: "GROUP_2",
  GROUP_3: "GROUP_3",
  LEFTOVERS: "LEFTOVERS",
  DISCARD: "DISCARD",
} as const;

export type ClosureSlot = (typeof CLOSURE_SLOT)[keyof typeof CLOSURE_SLOT];

export const GROUP_SLOTS: readonly ClosureSlot[] = [CLOSURE_SLOT.GROUP_1, CLOSURE_SLOT.GROUP_2, CLOSURE_SLOT.GROUP_3];

export const SUBMIT_STATUS = {
  IDLE: "IDLE",
  SUBMITTING: "SUBMITTING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  FAILED: "FAILED",
} as const;

type PlainSubmitStatus = Exclude<(typeof SUBMIT_STATUS)[keyof typeof SUBMIT_STATUS], typeof SUBMIT_STATUS.REJECTED>;

export type SubmitState =
  | { readonly status: PlainSubmitStatus }
  | { readonly status: typeof SUBMIT_STATUS.REJECTED; readonly reason: string };

export type SubmitClosure = (declaration: ClosureDeclarationDto) => Promise<ActionResult>;

export interface ClosureDialogProps {
  open: boolean;
  cards: readonly CardDto[];
  enabledClosures: readonly ClosureType[];
  cannotDiscard: CardDto | null;
  timer: ReactNode;
  onClose: () => void;
  onSubmit: SubmitClosure;
}

export interface ClosureFormProps extends Omit<ClosureDialogProps, "open" | "timer" | "onSubmit"> {
  state: SubmitState;
  onSubmit: (declaration: ClosureDeclarationDto) => void;
}

export interface ClosureCardButtonProps {
  card: CardDto;
  label: string;
  isSelected?: boolean;
  isLocked?: boolean;
  onPress: (id: string) => void;
}

export interface SlotPanelProps {
  slot: ClosureSlot;
  title: string;
  cards: readonly CardDto[];
  canAssign: boolean;
  onAssign: (slot: ClosureSlot) => void;
  onReturn: (id: string) => void;
}
