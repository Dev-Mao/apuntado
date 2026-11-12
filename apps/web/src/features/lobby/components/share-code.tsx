"use client";

import { useTranslation } from "react-i18next";

import { Button, BUTTON_VARIANT, CopyIcon } from "@/components";

import { useCopyCode } from "../hooks";

export function ShareCode({ code }: { code: string }) {
  const { t } = useTranslation();
  const { copied, handleCopy } = useCopyCode(code);

  return (
    <div className="flex flex-col items-center gap-2 text-center text-paper">
      <p className="label-caps text-[0.55rem] text-paper/70 sm:text-[0.62rem]">{t("lobby.codeLabel")}</p>
      <p className="text-[clamp(2.6rem,12vw,5rem)] leading-none tracking-[0.12em]">{code}</p>
      <Button variant={BUTTON_VARIANT.LIGHT} onClick={handleCopy} className="mt-1 min-h-10 px-4">
        <CopyIcon className="size-4" />
        {copied ? t("lobby.copied") : t("lobby.copy")}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? t("lobby.copied") : ""}
      </span>
    </div>
  );
}
