"use client";

import { useTranslation } from "react-i18next";

import { Dialog } from "@/components";

import { ClosureForm } from "./closure-form";

import type { ClosureDialogProps } from "../types";

export function ClosureDialog({ open, cards, allowedClosureTypes, onClose, onSubmit }: ClosureDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} title={t("closure.title")} closeLabel={t("common.close")} onClose={onClose} className="sm:w-[min(100%-3rem,54rem)]">
      {open && <ClosureForm cards={cards} allowedClosureTypes={allowedClosureTypes} onClose={onClose} onSubmit={onSubmit} />}
    </Dialog>
  );
}
