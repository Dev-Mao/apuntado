"use client";

import { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";

import { useRealtime } from "@/features/realtime";
import { DEFAULT_TABLE_SETTINGS } from "@/lib";

import { HOME_FORM } from "../types";
import { validateCode, validateNickname, validateSettings } from "../validation";

import type { HomeErrors, HomeForm, NumericSettingField, ServerError, SettingsDraft } from "../types";
import type { GameMode, RoomResult, RoomSettings } from "@apuntado/contracts";
import type { FormEvent } from "react";

const INITIAL_SETTINGS: SettingsDraft = {
  mode: DEFAULT_TABLE_SETTINGS.mode,
  eliminationThreshold: String(DEFAULT_TABLE_SETTINGS.eliminationThreshold),
  turnSeconds: String(DEFAULT_TABLE_SETTINGS.turnSeconds),
  stake: String(DEFAULT_TABLE_SETTINGS.stake),
};

function toRoomSettings(draft: SettingsDraft): RoomSettings {
  return {
    mode: draft.mode,
    eliminationThreshold: Number(draft.eliminationThreshold),
    turnSeconds: Number(draft.turnSeconds),
    stake: Number(draft.stake),
  };
}

export function useHomeForm(linkCode: string | null) {
  const { t } = useTranslation();
  const { session, entryNotice, commands, startSession, setEntryNotice } = useRealtime();
  const [nicknameDraft, setNicknameDraft] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsDraft>(INITIAL_SETTINGS);
  const [codeDraft, setCodeDraft] = useState<string | null>(null);
  const [errors, setErrors] = useState<HomeErrors>({});
  const [pending, setPending] = useState<HomeForm | null>(null);
  const [serverError, setServerError] = useState<ServerError | null>(null);
  const nickname = nicknameDraft ?? (session.status === "ready" ? session.session.nickname : "");
  const code = codeDraft ?? linkCode?.toUpperCase() ?? "";

  const enter = useCallback(
    async (form: HomeForm, nextErrors: HomeErrors, command: () => Promise<RoomResult>) => {
      setErrors(nextErrors);
      setServerError(null);
      setEntryNotice(null);
      if (Object.keys(nextErrors).length > 0) return;
      setPending(form);
      try {
        const started = await startSession(nickname.trim());
        const result = started.ok ? await command() : started;
        if (result.ok) return;
        setServerError({ form, message: result.reason });
      } catch {
        setServerError({ form, message: t("common.unavailable") });
      }
      setPending(null);
    },
    [nickname, startSession, setEntryNotice, t],
  );

  const handleCreate = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextErrors = { ...validateNickname(nickname), ...validateSettings(settings) };
      void enter(HOME_FORM.CREATE, nextErrors, () => commands.createRoom(toRoomSettings(settings)));
    },
    [nickname, settings, enter, commands],
  );

  const handleJoin = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextErrors = { ...validateNickname(nickname), ...validateCode(code) };
      void enter(HOME_FORM.JOIN, nextErrors, () => commands.joinRoom(code.trim()));
    },
    [nickname, code, enter, commands],
  );

  const handleModeChange = useCallback((mode: GameMode) => setSettings((prev) => ({ ...prev, mode })), []);

  const handleNumberChange = useCallback(
    (field: NumericSettingField, value: string) => setSettings((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const handleCodeChange = useCallback((value: string) => setCodeDraft(value.toUpperCase()), []);

  const errorFor = (form: HomeForm) => (serverError?.form === form ? serverError.message : undefined);

  return {
    nickname,
    settings,
    code,
    entryNotice,
    errors,
    pending,
    createError: errorFor(HOME_FORM.CREATE),
    joinError: errorFor(HOME_FORM.JOIN),
    handleNicknameChange: setNicknameDraft,
    handleModeChange,
    handleNumberChange,
    handleCodeChange,
    handleCreate,
    handleJoin,
  };
}
