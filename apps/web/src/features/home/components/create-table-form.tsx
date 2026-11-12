"use client";

import { memo } from "react";

import { useTranslation } from "react-i18next";

import { TextField } from "@/components";

import { CREATE_FORM_ID, HOME_FIELD } from "../types";
import { ModeCards } from "./mode-cards";

import type { CreateTableFormProps } from "../types";

function CreateTableFormBase({ settings, errors, onModeChange, onNumberChange, onSubmit }: CreateTableFormProps) {
  const { t } = useTranslation();
  const errorText = (field: keyof typeof errors) => (errors[field] ? t(`home.errors.${errors[field]}`) : undefined);

  return (
    <form id={CREATE_FORM_ID} noValidate onSubmit={onSubmit} aria-labelledby="create-title" className="flex flex-col gap-8">
      <h2 id="create-title" className="sr-only">
        {t("home.create.title")}
      </h2>
      <ModeCards value={settings.mode} onChange={onModeChange} />
      <fieldset className="flex flex-col">
        <legend className="label-caps mb-4 flex items-center gap-4 text-[0.68rem]">
          {t("settings.title")}
          <span aria-hidden="true" className="h-px w-12 bg-ink/40" />
        </legend>
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-3">
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
      </fieldset>
    </form>
  );
}

export const CreateTableForm = memo(CreateTableFormBase);
