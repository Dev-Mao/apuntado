"use client";

import { useTranslation } from "react-i18next";

import { TextField } from "@/components";
import { GuestNudge } from "@/features/account";
import { cn } from "@/lib";

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
    <section aria-labelledby="entry-title" className="overflow-hidden rounded-[1.75rem] border-2 border-ink bg-paper-light text-ink shadow-[6px_7px_0_var(--color-ink)]">
      <div className="flex flex-col gap-5 px-5 pt-6 pb-6 short:gap-4 short:pt-5 short:pb-5 sm:px-8 sm:pt-7">
        <h2
          id="entry-title"
          className={cn("font-display leading-[0.95]", invited ? "text-[2rem] sm:text-[2.3rem]" : "text-[2.3rem] short:text-[2rem] sm:text-[2.6rem]")}
        >
          {invited ? t("home.entry.invitedTitle", { code: linkCode.toUpperCase() }) : t("home.entry.title")}
        </h2>
        <form noValidate onSubmit={form.handleNicknameSubmit} aria-labelledby="nickname-title" className="flex flex-col gap-2">
          <h3 id="nickname-title" className="sr-only">
            {t("home.nickname.title")}
          </h3>
          <TextField
            label={t("home.nickname.label")}
            placeholder={t("home.nickname.placeholder")}
            autoComplete="nickname"
            autoFocus={invited}
            maxLength={16}
            disabled={form.registered}
            hint={form.registered ? t("account.registeredNickname") : undefined}
            value={form.nickname}
            error={form.errors.nickname ? t(`home.errors.${form.errors.nickname}`) : undefined}
            onChange={(event) => form.handleNicknameChange(event.target.value)}
          />
          <GuestNudge className="text-sm short:hidden" />
        </form>
        <CreateTableForm
          settings={form.settings}
          errors={form.errors}
          pending={pending}
          invited={invited}
          serverError={form.createError}
          onModeChange={form.handleModeChange}
          onNumberChange={form.handleNumberChange}
          onJokersChange={form.handleJokersChange}
          onSubmit={form.handleCreate}
        />
      </div>
      <div className="bg-peach px-5 pt-4 pb-5 sm:px-8">
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
