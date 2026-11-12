"use client";

import { memo } from "react";

import { useTranslation } from "react-i18next";

import { Button, BUTTON_VARIANT, LiveNotice, TextField } from "@/components";

import type { JoinTableFormProps } from "../types";

function JoinTableFormBase({ code, error, pending, serverError, emphasized, onCodeChange, onSubmit }: JoinTableFormProps) {
  const { t } = useTranslation();
  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby="join-title" className="flex flex-col gap-3">
      <h2 id="join-title" className="sr-only">
        {t("home.join.title")}
      </h2>
      <div className="flex items-start gap-2">
        <TextField
          tone="ink"
          label={t("home.join.label")}
          placeholder={t("home.join.placeholder")}
          autoComplete="off"
          maxLength={8}
          value={code}
          error={error ? t(`home.errors.${error}`) : undefined}
          onChange={(event) => onCodeChange(event.target.value)}
          className="min-w-0 flex-1 [&_input]:tracking-[0.3em] [&_input]:uppercase"
        />
        <Button
          type="submit"
          variant={emphasized ? BUTTON_VARIANT.PRIMARY : BUTTON_VARIANT.LIGHT}
          disabled={pending}
          aria-busy={pending}
          className="mt-[1.6rem] h-12 px-5"
        >
          {t("home.join.submit")}
        </Button>
      </div>
      <LiveNotice message={serverError} className="text-salmon" />
    </form>
  );
}

export const JoinTableForm = memo(JoinTableFormBase);
