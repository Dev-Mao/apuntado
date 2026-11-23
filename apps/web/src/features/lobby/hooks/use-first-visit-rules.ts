"use client";

import { useCallback, useState } from "react";

const RULES_SEEN_KEY = "apuntado.reglas-vistas";

function rulesSeen(): boolean {
  try {
    return localStorage.getItem(RULES_SEEN_KEY) !== null;
  } catch {
    return true;
  }
}

function markRulesSeen(): void {
  try {
    localStorage.setItem(RULES_SEEN_KEY, "1");
  } catch {
    return;
  }
}

export function useFirstVisitRules() {
  const [open, setOpen] = useState(() => !rulesSeen());
  const close = useCallback(() => {
    markRulesSeen();
    setOpen(false);
  }, []);
  return { open, close };
}
