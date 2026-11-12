"use client";

import { useTranslation } from "react-i18next";

import { TextField } from "@/components";

import { CreateTableForm } from "./create-table-form";
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
    <section
      aria-labelledby="entry-title"
      className="relative flex flex-col gap-5 rounded-[2rem] bg-ink px-5 pt-6 pb-6 text-paper shadow-sheet short:gap-3.5 short:pt-5 short:pb-5 sm:px-9 sm:pt-8 sm:pb-8"
    >
      <div>
        <p className="label-caps flex items-center gap-4 text-[0.62rem] text-paper/75 short:hidden">
          {t("home.entry.eyebrow")}
          <span aria-hidden="true" className="h-px w-12 bg-paper/40" />
        </p>
        <h2 id="entry-title" className="mt-2 font-display text-[2.3rem] leading-[0.95] font-semibold italic short:mt-0 short:text-[1.9rem] sm:text-[2.9rem]">
          {invited ? t("home.entry.invitedTitle", { code: linkCode.toUpperCase() }) : t("home.entry.title")}
        </h2>
      </div>
      <form noValidate onSubmit={form.handleNicknameSubmit} aria-labelledby="nickname-title">
        <h3 id="nickname-title" className="sr-only">
          {t("home.nickname.title")}
        </h3>
        <TextField
          tone="ink"
          label={t("home.nickname.label")}
          placeholder={t("home.nickname.placeholder")}
          autoComplete="nickname"
          autoFocus={invited}
          maxLength={16}
          value={form.nickname}
          error={form.errors.nickname ? t(`home.errors.${form.errors.nickname}`) : undefined}
          onChange={(event) => form.handleNicknameChange(event.target.value)}
        />
      </form>
      <CreateTableForm
        settings={form.settings}
        errors={form.errors}
        pending={pending}
        invited={invited}
        serverError={form.createError}
        onModeChange={form.handleModeChange}
        onNumberChange={form.handleNumberChange}
        onSubmit={form.handleCreate}
      />
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="h-px flex-1 bg-paper/20" />
        <span className="text-paper/60 italic">{t("home.entry.or")}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-paper/20" />
      </div>
      <JoinTableForm
        code={form.code}
        error={form.errors.code}
        pending={pending}
        serverError={form.joinError}
        emphasized={invited}
        onCodeChange={form.handleCodeChange}
        onSubmit={form.handleJoin}
      />
    </section>
  );
}
