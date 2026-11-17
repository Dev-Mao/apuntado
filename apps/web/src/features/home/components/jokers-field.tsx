"use client";

import Image from "next/image";

import { useTranslation } from "react-i18next";

import { JOKER_IMAGE_SRC } from "@/lib";

interface JokersFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function JokersField({ checked, onChange }: JokersFieldProps) {
  const { t } = useTranslation();

  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-ink/15 p-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-coral-ink">
      <Image src={JOKER_IMAGE_SRC} alt="" width={400} height={560} className="w-14 shrink-0 rounded-[7%/5%] shadow-card" />
      <span className="flex flex-1 flex-col gap-1.5">
        <span className="label-caps text-[0.65rem] text-ink-soft">{t("settings.jokers")}</span>
        <span className="text-sm italic text-ink-soft">{t("settings.jokersHint")}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 shrink-0 cursor-pointer accent-coral-ink"
      />
    </label>
  );
}
