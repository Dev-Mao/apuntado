"use client";

import { useCallback, useState } from "react";

export function useClosurePrompt(canDeclare: boolean, onExpire: () => void) {
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);

  if (open && !canDeclare) {
    setOpen(false);
    onExpire();
  }

  const handleOpen = useCallback(() => {
    setAttempt((n) => n + 1);
    setOpen(true);
  }, []);
  const handleClose = useCallback(() => setOpen(false), []);

  return { open, attempt, handleOpen, handleClose };
}
