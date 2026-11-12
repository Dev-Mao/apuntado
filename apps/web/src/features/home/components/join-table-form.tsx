"use client";

import { memo } from "react";

import { useTranslation } from "react-i18next";

import { Button, BUTTON_VARIANT, LiveNotice, TextField } from "@/components";

import type { JoinTableFormProps } from "../types";

function JoinTableFormBase({ code, error, pending, serverError, onCodeChange, onSubmit }: JoinTableFormProps) {
  const { t } = useTranslation();
  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby="join-title" className="flex flex-col gap-5">
      <h2 id="join-title" className="font-display text-2xl sm:text-3xl">
        {t("home.join.title")}
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <TextField
          label={t("home.join.label")}
          placeholder={t("home.join.placeholder")}
          autoComplete="off"
          maxLength={8}
          value={code}
          error={error ? t(`home.errors.${error}`) : undefined}
          onChange={(event) => onCodeChange(event.target.value)}
          className="flex-1 [&_input]:tracking-[0.3em] [&_input]:uppercase"
        />
        <Button type="submit" variant={BUTTON_VARIANT.OUTLINE} disabled={pending} aria-busy={pending} className="sm:mt-[1.6rem]">
          {t("home.join.submit")}
        </Button>
      </div>
      <LiveNotice message={serverError} />
    </form>
  );
}

export const JoinTableForm = memo(JoinTableFormBase);
