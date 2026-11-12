"use client";

import { useTranslation } from "react-i18next";

import { TextField } from "@/components";
import { useAuthDialog, useWallet, AUTH_MODE } from "@/features/account";
import { useRealtime } from "@/features/realtime";

interface StakeFieldProps {
  value: string;
  error: string | undefined;
  onChange: (value: string) => void;
}

export function StakeField({ value, error, onChange }: StakeFieldProps) {
  const { t } = useTranslation();
  const { session } = useRealtime();
  const { wallet } = useWallet();
  const { openAuth } = useAuthDialog();
  const registered = session.status === "ready" && !session.session.guest;

  if (!registered) {
    return (
      <div className="flex flex-col gap-2">
        <TextField label={t("settings.stake")} type="number" value="0" disabled readOnly aria-describedby="stake-guest" />
        <p id="stake-guest" className="-mt-1 text-sm italic text-ink-soft">
          {t("settings.stakeGuest")}{" "}
          <button type="button" onClick={() => openAuth(AUTH_MODE.REGISTER)} className="label-caps text-[0.58rem] text-coral-ink not-italic underline underline-offset-4">
            {t("settings.stakeGuestAction")}
          </button>
        </p>
      </div>
    );
  }

  return (
    <TextField
      label={t("settings.stake")}
      hint={wallet ? t("settings.stakeBalance", { chips: t("common.chips", { count: wallet.balance }) }) : t("settings.stakeHint")}
      type="number"
      inputMode="numeric"
      min={0}
      value={value}
      error={error}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
