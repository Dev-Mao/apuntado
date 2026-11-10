import type { GameMode } from "@apuntado/contracts";
import type { FormEvent } from "react";

export const HOME_FIELD = {
  NICKNAME: "nickname",
  THRESHOLD: "eliminationThreshold",
  TURN: "turnSeconds",
  STAKE: "stake",
  CODE: "code",
} as const;

export type HomeField = (typeof HOME_FIELD)[keyof typeof HOME_FIELD];

export type HomeErrorKey =
  | "nicknameRequired"
  | "nicknameLength"
  | "thresholdInvalid"
  | "turnInvalid"
  | "stakeInvalid"
  | "codeRequired";

export type HomeErrors = Partial<Record<HomeField, HomeErrorKey>>;

export type NumericSettingField = typeof HOME_FIELD.THRESHOLD | typeof HOME_FIELD.TURN | typeof HOME_FIELD.STAKE;

export interface SettingsDraft {
  readonly mode: GameMode;
  readonly eliminationThreshold: string;
  readonly turnSeconds: string;
  readonly stake: string;
}

export interface CreateTableFormProps {
  settings: SettingsDraft;
  errors: HomeErrors;
  onModeChange: (mode: GameMode) => void;
  onNumberChange: (field: NumericSettingField, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export interface JoinTableFormProps {
  code: string;
  error: HomeErrorKey | undefined;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}
