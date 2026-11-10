"use client";

import { memo, useMemo } from "react";

import { useTranslation } from "react-i18next";

import { Button, ChoicePills, TextField } from "@/components";
import { GAME_MODES } from "@/lib";

import { HOME_FIELD } from "../types";

import type { CreateTableFormProps } from "../types";

function CreateTableFormBase({ settings, errors, onModeChange, onNumberChange, onSubmit }: CreateTableFormProps) {
  const { t } = useTranslation();
  const modeOptions = useMemo(() => GAME_MODES.map((mode) => ({ value: mode, label: t(`gameMode.${mode}`) })), [t]);
  const errorText = (field: keyof typeof errors) => (errors[field] ? t(`home.errors.${errors[field]}`) : undefined);

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby="create-title" className="flex flex-col gap-5">
      <h2 id="create-title" className="font-display text-2xl sm:text-3xl">
        {t("home.create.title")}
      </h2>
      <ChoicePills
        legend={t("settings.mode")}
        name="mode"
        options={modeOptions}
        value={settings.mode}
        onChange={onModeChange}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label={t("settings.threshold")}
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
        <TextField
          label={t("settings.stake")}
          hint={t("settings.stakeHint")}
          type="number"
          inputMode="numeric"
          min={0}
          value={settings.stake}
          error={errorText(HOME_FIELD.STAKE)}
          onChange={(event) => onNumberChange(HOME_FIELD.STAKE, event.target.value)}
        />
      </div>
      <Button type="submit" className="self-start">
        {t("home.create.submit")}
      </Button>
    </form>
  );
}

export const CreateTableForm = memo(CreateTableFormBase);
