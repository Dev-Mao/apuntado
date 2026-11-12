"use client";

import { useCallback, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { Dialog } from "@/components";

import { AuthDialogContext } from "../auth-context";
import { WalletContext } from "../context";
import { useWalletStore } from "../hooks";
import { AUTH_MODE } from "../types";
import { AuthForm } from "./auth-form";

import type { AuthMode } from "../types";
import type { ReactNode } from "react";

export function AccountProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const wallet = useWalletStore();
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [lastMode, setLastMode] = useState<AuthMode>(AUTH_MODE.LOGIN);
  const openAuth = useCallback((next: AuthMode) => {
    setLastMode(next);
    setMode(next);
  }, []);
  const close = useCallback(() => setMode(null), []);
  const auth = useMemo(() => ({ openAuth }), [openAuth]);
  const title = lastMode === AUTH_MODE.REGISTER ? t("account.registerTitle") : t("account.loginTitle");

  return (
    <WalletContext.Provider value={wallet}>
      <AuthDialogContext.Provider value={auth}>
        {children}
        <Dialog open={mode !== null} title={title} closeLabel={t("common.close")} onClose={close}>
          {mode !== null && <AuthForm mode={mode} onSwitch={() => openAuth(mode === AUTH_MODE.LOGIN ? AUTH_MODE.REGISTER : AUTH_MODE.LOGIN)} onDone={close} />}
        </Dialog>
      </AuthDialogContext.Provider>
    </WalletContext.Provider>
  );
}
