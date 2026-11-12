"use client";

import { useCallback } from "react";

import { useTranslation } from "react-i18next";

import { Dialog } from "@/components";

import { useClosureSubmit } from "../hooks";
import { SUBMIT_STATUS } from "../types";
import { ClosureForm } from "./closure-form";

import type { ClosureDialogProps } from "../types";
import type { ClosureDeclarationDto } from "@apuntado/contracts";

export function ClosureDialog({ open, cards, enabledClosures, cannotDiscard, timer, onClose, onSubmit }: ClosureDialogProps) {
  const { t } = useTranslation();
  const { state, submit, reset } = useClosureSubmit(onSubmit);
  const isSubmitting = state.status === SUBMIT_STATUS.SUBMITTING;

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);
  const handleSubmit = useCallback((declaration: ClosureDeclarationDto) => void submit(declaration), [submit]);

  return (
    <Dialog
      open={open}
      title={t("closure.title")}
      closeLabel={t("common.close")}
      dismissible={!isSubmitting}
      onClose={handleClose}
      className="sm:w-[min(100%-3rem,58rem)]"
    >
      {open && state.status !== SUBMIT_STATUS.ACCEPTED && (
        <>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-ink-soft italic">{t("closure.timeLeft")}</span>
            {timer}
          </div>
          <ClosureForm
            cards={cards}
            enabledClosures={enabledClosures}
            cannotDiscard={cannotDiscard}
            state={state}
            onClose={handleClose}
            onEdit={reset}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </Dialog>
  );
}
