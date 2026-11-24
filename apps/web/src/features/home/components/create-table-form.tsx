"use client";

import { memo, useState } from "react";

import { useTranslation } from "react-i18next";

import { ArrowIcon, Button, BUTTON_VARIANT, LiveNotice, SlidersIcon } from "@/components";

import { HOME_FIELD } from "../types";
import { ModeCards } from "./mode-cards";
import { SettingsDialog } from "./settings-dialog";

import type { CreateTableFormProps } from "../types";

const SETTING_FIELDS = [HOME_FIELD.THRESHOLD, HOME_FIELD.TURN, HOME_FIELD.STAKE] as const;

function CreateTableFormBase({ settings, errors, pending, invited, serverError, onModeChange, onNumberChange, onJokersChange, onSubmit }: CreateTableFormProps) {
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
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl border border-dashed border-paper/30 py-2 pr-2 pl-4">
        <p className="min-w-0 flex-1 basis-48 text-paper/80">
          {t(settings.jokers ? "home.settingsSummaryJokers" : "home.settingsSummary", { threshold: settings.eliminationThreshold, seconds: settings.turnSeconds, stake })}
        </p>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="label-caps inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-coral px-4 text-[0.68rem] text-coral transition-colors hover:bg-coral hover:text-ink"
        >
          <SlidersIcon className="size-4" />
          {t("home.settingsEdit")}
        </button>
      </div>
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
        onJokersChange={onJokersChange}
        onClose={() => setSettingsOpen(false)}
      />
    </form>
  );
}

export const CreateTableForm = memo(CreateTableFormBase);
