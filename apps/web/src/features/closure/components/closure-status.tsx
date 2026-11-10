"use client";

import { useTranslation } from "react-i18next";

import { ButtonLink } from "@/components";
import { ROUTES } from "@/lib";

import { SUBMIT_STATUS } from "../types";

import type { SubmitState } from "../types";

export function ClosureStatus({ state }: { state: SubmitState }) {
  const { t } = useTranslation();

  return (
    <div aria-live="polite" className="empty:hidden">
      {state.status === SUBMIT_STATUS.REJECTED && (
        <div role="alert" className="flex gap-3 rounded-2xl border-[1.5px] border-coral-deep bg-coral/10 p-4">
          <span aria-hidden="true" className="mt-1 size-2.5 shrink-0 rounded-full bg-coral-deep" />
          <div>
            <p className="label-caps text-[0.65rem] text-coral-deep">{t("closure.rejectedTitle")}</p>
            <p className="mt-1 font-display text-lg">
              {t(`closure.rejection.${state.rejection.code}`, { sum: state.rejection.sum, limit: state.rejection.limit })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ClosureSuccess() {
  const { t } = useTranslation();
  return (
    <div role="status" className="relative mt-6 overflow-hidden rounded-3xl bg-felt px-6 pt-16 pb-10 text-center text-paper">
      <span aria-hidden="true" className="absolute -top-20 left-1/2 size-32 -translate-x-1/2 rounded-full bg-coral" />
      <p className="relative font-display text-4xl italic">{t("closure.accepted.title")}</p>
      <p className="relative mt-3 text-paper/80">{t("closure.accepted.body")}</p>
      <ButtonLink href={ROUTES.ROUND_RESULTS} className="relative mt-6">
        {t("closure.accepted.cta")}
      </ButtonLink>
    </div>
  );
}
