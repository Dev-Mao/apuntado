"use client";

import { useTranslation } from "react-i18next";

import { BUTTON_VARIANT, Button, Dialog } from "@/components";
import { useAbandonGame } from "@/features/realtime";

interface AbandonDialogProps {
  open: boolean;
  stake: number;
  onClose: () => void;
}

export function AbandonDialog({ open, stake, onClose }: AbandonDialogProps) {
  const { t } = useTranslation();
  const { notice, pending, abandon } = useAbandonGame();

  return (
    <Dialog open={open} title={t("table.abandon.title")} closeLabel={t("common.close")} dismissible={!pending} onClose={onClose}>
      <p className="mt-4 leading-relaxed">{t("table.abandon.lost")}</p>
      {stake > 0 && <p className="mt-2 leading-relaxed">{t("table.abandon.stake", { chips: t("common.chips", { count: stake }) })}</p>}
      {notice && (
        <p role="alert" className="mt-4 text-coral-ink">
          {notice}
        </p>
      )}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant={BUTTON_VARIANT.DANGER} disabled={pending} onClick={() => void abandon()}>
          {t("table.abandon.confirm")}
        </Button>
        <Button variant={BUTTON_VARIANT.OUTLINE} autoFocus disabled={pending} onClick={onClose}>
          {t("table.abandon.stay")}
        </Button>
      </div>
    </Dialog>
  );
}
