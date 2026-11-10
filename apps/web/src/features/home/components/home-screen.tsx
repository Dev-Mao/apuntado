"use client";

import { useTranslation } from "react-i18next";

import { AppHeader, TextField } from "@/components";

import { CreateTableForm } from "./create-table-form";
import { HomeHero } from "./home-hero";
import { JoinTableForm } from "./join-table-form";
import { useHomeForm } from "../hooks/use-home-form";

export function HomeScreen() {
  const { t } = useTranslation();
  const form = useHomeForm();

  return (
    <div className="mx-auto flex min-h-dvh max-w-[90rem] flex-col">
      <AppHeader />
      <main className="grid flex-1 gap-10 px-5 pb-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-8">
        <HomeHero />
        <div className="flex flex-col divide-y divide-line border-y border-line lg:self-start">
          <section aria-labelledby="nickname-title" className="flex flex-col gap-5 py-7">
            <h2 id="nickname-title" className="font-display text-2xl sm:text-3xl">
              {t("home.nickname.title")}
            </h2>
            <TextField
              label={t("home.nickname.label")}
              placeholder={t("home.nickname.placeholder")}
              hint={t("home.nickname.hint")}
              autoComplete="nickname"
              maxLength={16}
              value={form.nickname}
              error={form.errors.nickname ? t(`home.errors.${form.errors.nickname}`) : undefined}
              onChange={(event) => form.handleNicknameChange(event.target.value)}
            />
          </section>
          <div className="py-7">
            <CreateTableForm
              settings={form.settings}
              errors={form.errors}
              onModeChange={form.handleModeChange}
              onNumberChange={form.handleNumberChange}
              onSubmit={form.handleCreate}
            />
          </div>
          <div className="py-7">
            <JoinTableForm
              code={form.code}
              error={form.errors.code}
              onCodeChange={form.handleCodeChange}
              onSubmit={form.handleJoin}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
