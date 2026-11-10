import type { CardDto, ClosureType } from "@apuntado/contracts";

export const CLOSURE_SLOT = {
  GROUP_1: "GROUP_1",
  GROUP_2: "GROUP_2",
  GROUP_3: "GROUP_3",
  LEFTOVERS: "LEFTOVERS",
  DISCARD: "DISCARD",
} as const;

export type ClosureSlot = (typeof CLOSURE_SLOT)[keyof typeof CLOSURE_SLOT];

export const GROUP_SLOTS: readonly ClosureSlot[] = [CLOSURE_SLOT.GROUP_1, CLOSURE_SLOT.GROUP_2, CLOSURE_SLOT.GROUP_3];

export interface ClosureDraft {
  readonly type: ClosureType;
  readonly groups: readonly (readonly CardDto[])[];
  readonly leftovers: readonly CardDto[];
  readonly discard: CardDto | null;
}

export const CLOSURE_REJECTION = {
  LEFTOVER_TOO_HIGH: "LEFTOVER_TOO_HIGH",
} as const;

export interface ClosureRejection {
  readonly code: (typeof CLOSURE_REJECTION)[keyof typeof CLOSURE_REJECTION];
  readonly sum: number;
  readonly limit: number;
}

export type ClosureResponse =
  | { readonly status: "ACCEPTED" }
  | { readonly status: "REJECTED"; readonly rejection: ClosureRejection };

export const SUBMIT_STATUS = {
  IDLE: "IDLE",
  SUBMITTING: "SUBMITTING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
} as const;

export type SubmitState =
  | { readonly status: typeof SUBMIT_STATUS.IDLE | typeof SUBMIT_STATUS.SUBMITTING | typeof SUBMIT_STATUS.ACCEPTED }
  | { readonly status: typeof SUBMIT_STATUS.REJECTED; readonly rejection: ClosureRejection };

export interface ClosureDialogProps {
  open: boolean;
  cards: readonly CardDto[];
  allowedClosureTypes: readonly ClosureType[];
  onClose: () => void;
  onSubmit: (draft: ClosureDraft) => Promise<ClosureResponse>;
}

export interface ClosureCardButtonProps {
  card: CardDto;
  label: string;
  isSelected?: boolean;
  onPress: (id: string) => void;
}

export interface SlotPanelProps {
  slot: ClosureSlot;
  title: string;
  cards: readonly CardDto[];
  onReturn: (id: string) => void;
}
