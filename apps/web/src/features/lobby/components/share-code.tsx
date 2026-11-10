"use client";

import { useTranslation } from "react-i18next";

import { Button, BUTTON_VARIANT } from "@/components";

import { useCopyCode } from "../hooks/use-copy-code";

export function ShareCode({ code }: { code: string }) {
  const { t } = useTranslation();
  const { copied, handleCopy } = useCopyCode(code);

  return (
    <section aria-labelledby="share-code-title" className="relative isolate overflow-hidden rounded-t-[10rem] rounded-b-3xl bg-felt px-6 pt-14 pb-8 text-paper sm:rounded-t-[14rem] sm:px-10 sm:pt-20">
      <span aria-hidden="true" className="absolute -top-24 -right-20 -z-10 size-56 rounded-full bg-coral sm:size-72" />
      <span aria-hidden="true" className="absolute -bottom-28 -left-16 -z-10 size-48 rounded-full border border-paper/20" />
      <h2 id="share-code-title" className="label-caps text-center text-[0.7rem] text-paper/70">
        {t("lobby.codeLabel")}
      </h2>
      <p className="mt-4 text-center font-display text-[clamp(3.5rem,12vw,7rem)] leading-none tracking-[0.18em]">
        {code}
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Button variant={BUTTON_VARIANT.OUTLINE_LIGHT} onClick={handleCopy}>
          {t("lobby.copy")}
        </Button>
        <p aria-live="polite" className="min-h-5 font-display text-sm text-paper/80 italic">
          {copied ? t("lobby.copied") : ""}
        </p>
      </div>
    </section>
  );
}
