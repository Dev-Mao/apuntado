import type { WalletView } from "@apuntado/contracts";

export type WalletStatus = "none" | "loading" | "ready" | "failed";

export interface WalletContextValue {
  readonly status: WalletStatus;
  readonly wallet: WalletView | null;
  readonly refresh: () => void;
}

export const AUTH_MODE = {
  LOGIN: "login",
  REGISTER: "register",
} as const;

export type AuthMode = (typeof AUTH_MODE)[keyof typeof AUTH_MODE];

export interface AuthDraft {
  readonly email: string;
  readonly password: string;
  readonly nickname: string;
}

export type AuthField = keyof AuthDraft;

export type AuthErrors = Partial<Record<AuthField, string>>;
