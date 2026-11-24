"use client";

import { useTranslation } from "react-i18next";

import { useRealtime } from "@/features/realtime";
import { cn } from "@/lib";

import { useAuthDialog } from "../auth-context";
import { AUTH_MODE } from "../types";

export function GuestNudge({ className }: { className?: string | undefined }) {
  const { t } = useTranslation();
  const { session } = useRealtime();
  const { openAuth } = useAuthDialog();
  if (session.status === "ready" && !session.session.guest) return null;

  return (
    <p className={cn("text-ink-soft", className)}>
      {t("account.guestNudge")}{" "}
      <button type="button" onClick={() => openAuth(AUTH_MODE.REGISTER)} className="label-caps text-[0.65rem] text-coral-ink underline underline-offset-4 hover:no-underline">
        {t("account.guestNudgeAction")}
      </button>
    </p>
  );
}
