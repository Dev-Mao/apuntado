"use client";

import { useTranslation } from "react-i18next";

import { ArrowIcon, Button, BUTTON_VARIANT, LiveNotice, SparkleIcon, TextField } from "@/components";

import { CREATE_FORM_ID } from "../types";
import { JoinTableForm } from "./join-table-form";

import type { useHomeForm } from "../hooks";

interface HomeEntryProps {
  form: ReturnType<typeof useHomeForm>;
  linkCode: string | null;
}

export function HomeEntry({ form, linkCode }: HomeEntryProps) {
  const { t } = useTranslation();
  const pending = form.pending !== null;
  const invited = linkCode !== null;

  return (
    <section aria-labelledby="entry-title" className="relative overflow-hidden rounded-[2rem] bg-ink px-6 pt-8 pb-7 text-paper shadow-sheet sm:px-10 sm:pt-10 sm:pb-9">
      <SparkleIcon className="absolute top-8 right-8 size-5 text-paper/70" />
      <p className="label-caps flex items-center gap-4 text-[0.65rem] text-paper/75">
        {t("home.entry.eyebrow")}
        <span aria-hidden="true" className="h-px w-12 bg-paper/40" />
      </p>
      <h2 id="entry-title" className="mt-3 text-[2.9rem] leading-[0.95] italic sm:text-[3.6rem]">
        {invited ? t("home.entry.invitedTitle", { code: linkCode.toUpperCase() }) : t("home.entry.title")}
      </h2>
      <p className="mt-3 max-w-sm text-lg leading-snug text-paper/75 italic">{t("home.intro")}</p>
      <form noValidate onSubmit={form.handleNicknameSubmit} aria-labelledby="nickname-title" className="mt-7">
        <h3 id="nickname-title" className="sr-only">
          {t("home.nickname.title")}
        </h3>
        <TextField
          tone="ink"
          label={t("home.nickname.label")}
          placeholder={t("home.nickname.placeholder")}
          hint={t("home.nickname.hint")}
          autoComplete="nickname"
          autoFocus={invited}
          maxLength={16}
          value={form.nickname}
          error={form.errors.nickname ? t(`home.errors.${form.errors.nickname}`) : undefined}
          onChange={(event) => form.handleNicknameChange(event.target.value)}
        />
      </form>
      <div className="mt-6 flex flex-col gap-2">
        <Button
          type="submit"
          form={CREATE_FORM_ID}
          variant={invited ? BUTTON_VARIANT.LIGHT : BUTTON_VARIANT.PRIMARY}
          disabled={pending}
          aria-busy={form.pending === "create"}
          className="w-full sm:w-auto sm:self-start"
        >
          {t("home.create.submit")}
          <ArrowIcon />
        </Button>
        <LiveNotice message={form.createError} className="text-salmon" />
      </div>
      <div className="mt-6 flex items-center gap-4">
        <span aria-hidden="true" className="h-px flex-1 bg-paper/20" />
        <span className="text-paper/60 italic">{t("home.entry.or")}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-paper/20" />
      </div>
      <div className="mt-4">
        <JoinTableForm
          code={form.code}
          error={form.errors.code}
          pending={pending}
          serverError={form.joinError}
          emphasized={invited}
          onCodeChange={form.handleCodeChange}
          onSubmit={form.handleJoin}
        />
      </div>
    </section>
  );
}
