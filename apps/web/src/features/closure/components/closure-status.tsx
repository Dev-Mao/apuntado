"use client";

import { useTranslation } from "react-i18next";

import { SUBMIT_STATUS } from "../types";

import type { SubmitState } from "../types";

function StatusAlert({ title, message }: { title: string; message: string }) {
  return (
    <div role="alert" className="flex animate-turn-in gap-3 rounded-2xl border-[1.5px] border-coral-ink bg-paper p-4">
      <span aria-hidden="true" className="mt-1.5 size-2.5 shrink-0 rounded-full bg-coral-ink" />
      <div>
        <p className="label-caps text-[0.62rem] text-coral-ink">{title}</p>
        <p className="mt-1 text-lg">{message}</p>
      </div>
    </div>
  );
}

export function ClosureStatus({ state }: { state: SubmitState }) {
  const { t } = useTranslation();

  return (
    <div aria-live="polite" className="empty:hidden">
      {state.status === SUBMIT_STATUS.REJECTED && <StatusAlert title={t("closure.rejectedTitle")} message={state.reason} />}
      {state.status === SUBMIT_STATUS.FAILED && (
        <StatusAlert title={t("closure.failedTitle")} message={t("closure.failedBody")} />
      )}
    </div>
  );
}
