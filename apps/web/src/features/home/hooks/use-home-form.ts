"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { DEFAULT_TABLE_SETTINGS, ROUTES } from "@/lib";

import { validateCode, validateNickname, validateSettings } from "../validation";

import type { HomeErrors, NumericSettingField, SettingsDraft } from "../types";
import type { GameMode } from "@apuntado/contracts";
import type { FormEvent } from "react";

const INITIAL_SETTINGS: SettingsDraft = {
  mode: DEFAULT_TABLE_SETTINGS.mode,
  eliminationThreshold: String(DEFAULT_TABLE_SETTINGS.eliminationThreshold),
  turnSeconds: String(DEFAULT_TABLE_SETTINGS.turnSeconds),
  stake: String(DEFAULT_TABLE_SETTINGS.stake),
};

export function useHomeForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [settings, setSettings] = useState<SettingsDraft>(INITIAL_SETTINGS);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<HomeErrors>({});

  const submitIfValid = useCallback(
    (nextErrors: HomeErrors) => {
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length === 0) router.push(ROUTES.LOBBY);
    },
    [router],
  );

  const handleCreate = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      submitIfValid({ ...validateNickname(nickname), ...validateSettings(settings) });
    },
    [nickname, settings, submitIfValid],
  );

  const handleJoin = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      submitIfValid({ ...validateNickname(nickname), ...validateCode(code) });
    },
    [nickname, code, submitIfValid],
  );

  const handleModeChange = useCallback((mode: GameMode) => setSettings((prev) => ({ ...prev, mode })), []);

  const handleNumberChange = useCallback(
    (field: NumericSettingField, value: string) => setSettings((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const handleCodeChange = useCallback((value: string) => setCode(value.toUpperCase()), []);

  return {
    nickname,
    settings,
    code,
    errors,
    handleNicknameChange: setNickname,
    handleModeChange,
    handleNumberChange,
    handleCodeChange,
    handleCreate,
    handleJoin,
  };
}
