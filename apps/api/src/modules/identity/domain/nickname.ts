const MIN_LENGTH = 2;
const MAX_LENGTH = 16;

export const normalizeNickname = (raw: unknown): string | null => {
  if (typeof raw !== "string") return null;
  const nickname = raw.trim().replace(/\s+/g, " ");
  return nickname.length >= MIN_LENGTH && nickname.length <= MAX_LENGTH ? nickname : null;
};
