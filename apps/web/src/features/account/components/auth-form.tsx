"use client";

import { useTranslation } from "react-i18next";

import { Button, LiveNotice, TextField } from "@/components";

import { useAuthForm } from "../hooks";
import { AUTH_MODE } from "../types";

import type { AuthMode } from "../types";

interface AuthFormProps {
  mode: AuthMode;
  onSwitch: () => void;
  onDone: () => void;
}

export function AuthForm({ mode, onSwitch, onDone }: AuthFormProps) {
  const { t } = useTranslation();
  const { draft, error, pending, handleSubmit, handleChange } = useAuthForm(mode, onDone);
  const registering = mode === AUTH_MODE.REGISTER;

  return (
    <form noValidate onSubmit={handleSubmit} aria-label={registering ? t("account.registerTitle") : t("account.loginTitle")} className="mt-5 flex flex-col gap-4 short:gap-3">
      {registering && <p className="text-lg text-ink-soft italic">{t("account.bonus")}</p>}
      {registering && (
        <TextField
          label={t("account.nickname")}
          autoComplete="nickname"
          maxLength={16}
          value={draft.nickname}
          onChange={(event) => handleChange("nickname", event.target.value)}
        />
      )}
      <TextField
        label={t("account.email")}
        type="email"
        autoComplete="email"
        autoFocus
        value={draft.email}
        onChange={(event) => handleChange("email", event.target.value)}
      />
      <TextField
        label={t("account.password")}
        type="password"
        autoComplete={registering ? "new-password" : "current-password"}
        value={draft.password}
        onChange={(event) => handleChange("password", event.target.value)}
      />
      <LiveNotice message={error} />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {registering ? t("account.submitRegister") : t("account.submitLogin")}
        </Button>
        <button type="button" onClick={onSwitch} className="text-lg italic underline underline-offset-4 hover:text-coral-ink">
          {registering ? t("account.switchToLogin") : t("account.switchToRegister")}
        </button>
      </div>
    </form>
  );
}
