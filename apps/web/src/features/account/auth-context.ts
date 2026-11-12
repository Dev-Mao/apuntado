"use client";

import { createContext, useContext } from "react";

import type { AuthMode } from "./types";

export interface AuthDialogContextValue {
  readonly openAuth: (mode: AuthMode) => void;
}

export const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

export function useAuthDialog(): AuthDialogContextValue {
  const value = useContext(AuthDialogContext);
  if (!value) throw new Error("useAuthDialog must be used inside AccountProvider");
  return value;
}
