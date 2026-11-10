"use client";

import { useCallback, useEffect, useState } from "react";

const COPIED_FEEDBACK_MS = 2000;

export function useCopyCode(code: string) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  }, [code]);

  return { copied, handleCopy };
}
