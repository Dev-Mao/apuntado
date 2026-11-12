"use client";

import { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";

import { useRealtime } from "@/features/realtime";
import { logInAccount, registerAccount } from "@/lib";

import { AUTH_MODE } from "../types";

import type { AuthDraft, AuthField, AuthMode } from "../types";
import type { AccountResult } from "@/lib";
import type { FormEvent } from "react";

const NO_DATABASE = 503;
const EMPTY_DRAFT: AuthDraft = { email: "", password: "", nickname: "" };

export function useAuthForm(mode: AuthMode, onDone: () => void) {
  const { t } = useTranslation();
  const { adoptSession } = useRealtime();
  const [draft, setDraft] = useState<AuthDraft>(EMPTY_DRAFT);
  const [failure, setFailure] = useState<{ mode: AuthMode; message: string } | null>(null);
  const [pending, setPending] = useState(false);

  const failureOf = useCallback(
    (result: Extract<AccountResult, { ok: false }>) => {
      if (result.status === NO_DATABASE) return t("account.noDatabase");
      return result.reason ?? t("common.unavailable");
    },
    [t],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPending(true);
      setFailure(null);
      try {
        const { email, password, nickname } = draft;
        const result = mode === AUTH_MODE.REGISTER ? await registerAccount({ email, password, nickname }) : await logInAccount({ email, password });
        if (result.ok) {
          adoptSession(result.session);
          onDone();
          return;
        }
        setFailure({ mode, message: failureOf(result) });
      } catch {
        setFailure({ mode, message: t("common.unavailable") });
      }
      setPending(false);
    },
    [draft, mode, adoptSession, onDone, failureOf, t],
  );

  const handleChange = useCallback((field: AuthField, value: string) => setDraft((prev) => ({ ...prev, [field]: value })), []);

  const error = failure?.mode === mode ? failure.message : null;

  return { draft, error, pending, handleSubmit, handleChange };
}
