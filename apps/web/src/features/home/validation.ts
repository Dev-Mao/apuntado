import type { HomeErrors, SettingsDraft } from "./types";

const NICKNAME_MIN = 2;
const NICKNAME_MAX = 16;
const MIN_TURN_SECONDS = 10;

function isIntegerAtLeast(value: string, min: number): boolean {
  const parsed = Number(value);
  return value.trim() !== "" && Number.isInteger(parsed) && parsed >= min;
}

export function validateNickname(nickname: string): HomeErrors {
  const length = nickname.trim().length;
  if (length === 0) return { nickname: "nicknameRequired" };
  if (length < NICKNAME_MIN || length > NICKNAME_MAX) return { nickname: "nicknameLength" };
  return {};
}

export function validateSettings(settings: SettingsDraft): HomeErrors {
  const errors: HomeErrors = {};
  if (!isIntegerAtLeast(settings.eliminationThreshold, 1)) errors.eliminationThreshold = "thresholdInvalid";
  if (!isIntegerAtLeast(settings.turnSeconds, MIN_TURN_SECONDS)) errors.turnSeconds = "turnInvalid";
  if (!isIntegerAtLeast(settings.stake, 0)) errors.stake = "stakeInvalid";
  return errors;
}

export function validateCode(code: string): HomeErrors {
  return code.trim() ? {} : { code: "codeRequired" };
}
