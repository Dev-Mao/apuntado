"use client";

import { useTranslation } from "react-i18next";

import { Button, Dialog, TextField } from "@/components";

import { HOME_FIELD } from "../types";
import { StakeField } from "./stake-field";

import type { HomeErrors, NumericSettingField, SettingsDraft } from "../types";

interface SettingsDialogProps {
  open: boolean;
  settings: SettingsDraft;
  errors: HomeErrors;
  onNumberChange: (field: NumericSettingField, value: string) => void;
  onClose: () => void;
}

export function SettingsDialog({ open, settings, errors, onNumberChange, onClose }: SettingsDialogProps) {
  const { t } = useTranslation();
  const errorText = (field: keyof HomeErrors) => (errors[field] ? t(`home.errors.${errors[field]}`) : undefined);

  return (
    <Dialog open={open} title={t("settings.title")} closeLabel={t("common.close")} onClose={onClose}>
      <div className="mt-6 flex flex-col gap-5">
        <TextField
          label={t("home.thresholdLabel")}
          hint={t("home.thresholdHint")}
          type="number"
          inputMode="numeric"
          min={1}
          value={settings.eliminationThreshold}
          error={errorText(HOME_FIELD.THRESHOLD)}
          onChange={(event) => onNumberChange(HOME_FIELD.THRESHOLD, event.target.value)}
        />
        <TextField
          label={t("settings.turn")}
          hint={t("settings.turnHint")}
          type="number"
          inputMode="numeric"
          min={10}
          value={settings.turnSeconds}
          error={errorText(HOME_FIELD.TURN)}
          onChange={(event) => onNumberChange(HOME_FIELD.TURN, event.target.value)}
        />
        <StakeField value={settings.stake} error={errorText(HOME_FIELD.STAKE)} onChange={(value) => onNumberChange(HOME_FIELD.STAKE, value)} />
        <Button onClick={onClose} className="self-start">
          {t("home.settingsDone")}
        </Button>
      </div>
    </Dialog>
  );
}
