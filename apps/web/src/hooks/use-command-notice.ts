"use client";

import { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import type { ActionResult } from "@apuntado/contracts";

const NOTICE_MS = 6000;

export function useCommandNotice() {
  const { t } = useTranslation();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (notice === null) return;
    const timer = window.setTimeout(() => setNotice(null), NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const run = useCallback(
    async (command: () => Promise<ActionResult>) => {
      setNotice(null);
      try {
        const result = await command();
        if (!result.ok) setNotice(result.reason);
        return result.ok;
      } catch {
        setNotice(t("common.unavailable"));
        return false;
      }
    },
    [t],
  );

  return { notice, run, show: setNotice };
}
