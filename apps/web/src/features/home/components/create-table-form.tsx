"use client";

import { memo, useState } from "react";

import { useTranslation } from "react-i18next";

import { ArrowIcon, Button, BUTTON_VARIANT, LiveNotice } from "@/components";

import { HOME_FIELD } from "../types";
import { ModeCards } from "./mode-cards";
import { SettingsDialog } from "./settings-dialog";

import type { CreateTableFormProps } from "../types";

const SETTING_FIELDS = [HOME_FIELD.THRESHOLD, HOME_FIELD.TURN, HOME_FIELD.STAKE] as const;

function CreateTableFormBase({ settings, errors, pending, invited, serverError, onModeChange, onNumberChange, onSubmit }: CreateTableFormProps) {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsInvalid = SETTING_FIELDS.some((field) => errors[field]);
  const stake = Number(settings.stake) > 0 ? t("common.chips", { count: Number(settings.stake) }) : t("home.stakeNone");

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby="create-title" className="flex flex-col gap-4 short:gap-3">
      <h3 id="create-title" className="sr-only">
        {t("home.create.title")}
      </h3>
      <ModeCards value={settings.mode} onChange={onModeChange} />
      <p className="flex flex-wrap items-baseline gap-x-2 text-paper/75 italic">
        {t("home.settingsSummary", { threshold: settings.eliminationThreshold, seconds: settings.turnSeconds, stake })}
        <button type="button" onClick={() => setSettingsOpen(true)} className="label-caps text-[0.58rem] text-coral not-italic underline-offset-4 hover:underline">
          {t("home.settingsEdit")}
        </button>
      </p>
      {settingsInvalid && <LiveNotice message={t("home.settingsInvalid")} className="text-salmon" />}
      <Button
        type="submit"
        variant={invited ? BUTTON_VARIANT.LIGHT : BUTTON_VARIANT.PRIMARY}
        disabled={pending}
        aria-busy={pending}
        className="w-full sm:w-auto sm:self-start"
      >
        {t("home.create.submit")}
        <ArrowIcon />
      </Button>
      <LiveNotice message={serverError} className="text-salmon" />
      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        errors={errors}
        onNumberChange={onNumberChange}
        onClose={() => setSettingsOpen(false)}
      />
    </form>
  );
}

export const CreateTableForm = memo(CreateTableFormBase);
