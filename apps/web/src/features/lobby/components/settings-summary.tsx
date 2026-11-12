"use client";

import { useTranslation } from "react-i18next";

import type { TableSettings } from "@/lib";

export function SettingsSummary({ settings }: { settings: TableSettings }) {
  const { t } = useTranslation();
  const rows = [
    { label: t("settings.mode"), value: t(`gameMode.${settings.mode}`) },
    { label: t("settings.threshold"), value: t("common.points", { count: settings.eliminationThreshold }) },
    { label: t("settings.turn"), value: t("common.seconds", { count: settings.turnSeconds }) },
    {
      label: t("settings.stake"),
      value: settings.stake > 0 ? t("common.chips", { count: settings.stake }) : t("common.noStake"),
    },
  ];

  return (
    <section aria-labelledby="settings-title" className="flex flex-col gap-3">
      <h2 id="settings-title" className="label-caps flex items-center gap-4 text-[0.65rem]">
        {t("settings.title")}
        <span aria-hidden="true" className="h-px w-12 bg-ink/40" />
      </h2>
      <dl className="grid grid-cols-2 gap-x-6 sm:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 border-t border-line py-3">
            <dt className="label-caps text-[0.55rem] text-ink-soft">{row.label}</dt>
            <dd className="text-xl">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
