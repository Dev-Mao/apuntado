"use client";

import { memo, useState } from "react";

import { useTranslation } from "react-i18next";

import { ArrowIcon, Button, BUTTON_VARIANT, LiveNotice, SlidersIcon } from "@/components";

import { HOME_FIELD } from "../types";
import { ModeCards } from "./mode-cards";
import { SettingsDialog } from "./settings-dialog";

import type { CreateTableFormProps, SettingsDraft } from "../types";
import type { TFunction } from "i18next";

const SETTING_FIELDS = [HOME_FIELD.THRESHOLD, HOME_FIELD.TURN, HOME_FIELD.STAKE] as const;

function settingChips(settings: SettingsDraft, t: TFunction): string[] {
  const stake = Number(settings.stake);
  return [
    t("home.chips.threshold", { threshold: settings.eliminationThreshold }),
    t("home.chips.turn", { seconds: settings.turnSeconds }),
    stake > 0 ? t("common.chips", { count: stake }) : t("home.chips.noStake"),
    ...(settings.jokers ? [t("home.chips.jokers")] : []),
  ];
}

function CreateTableFormBase({ settings, errors, pending, invited, serverError, onModeChange, onNumberChange, onJokersChange, onSubmit }: CreateTableFormProps) {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsInvalid = SETTING_FIELDS.some((field) => errors[field]);
  const chips = settingChips(settings, t);

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby="create-title" className="flex flex-col gap-4 short:gap-3">
      <h3 id="create-title" className="sr-only">
        {t("home.create.title")}
      </h3>
      <ModeCards value={settings.mode} onChange={onModeChange} />
      <div className="flex flex-col gap-2">
        <p className="label-caps text-[0.65rem] text-ink-soft">{t("home.tableLegend")}</p>
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span key={chip} className="rounded-full bg-paper-deep/70 px-3 py-1 text-sm font-semibold">
              {chip}
            </span>
          ))}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="label-caps inline-flex min-h-9 items-center gap-2 rounded-full border-2 border-ink bg-card px-3.5 text-[0.65rem] shadow-[2px_2px_0_var(--color-ink)] transition-[translate,box-shadow,background-color] hover:bg-peach active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <SlidersIcon className="size-4" />
            {t("home.settingsEdit")}
          </button>
        </div>
      </div>
      {settingsInvalid && <LiveNotice message={t("home.settingsInvalid")} className="font-semibold text-coral-ink" />}
      <Button
        type="submit"
        variant={invited ? BUTTON_VARIANT.OUTLINE : BUTTON_VARIANT.PRIMARY}
        disabled={pending}
        aria-busy={pending}
        className="mt-1 min-h-13 w-full text-[0.8rem]"
      >
        {t("home.create.submit")}
        <ArrowIcon />
      </Button>
      <LiveNotice message={serverError} className="font-semibold text-coral-ink" />
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
