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

export const HOME_FORM = {
  CREATE: "create",
  JOIN: "join",
} as const;

export type HomeForm = (typeof HOME_FORM)[keyof typeof HOME_FORM];

export interface ServerError {
  readonly form: HomeForm;
  readonly message: string;
}

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
  pending: boolean;
  serverError: string | undefined;
  onModeChange: (mode: GameMode) => void;
  onNumberChange: (field: NumericSettingField, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export interface JoinTableFormProps {
  code: string;
  error: HomeErrorKey | undefined;
  pending: boolean;
  serverError: string | undefined;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}
