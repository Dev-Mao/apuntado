"use client";

import { useCallback, useState } from "react";

export function useClosurePrompt(canDeclare: boolean, onExpire: () => void) {
  const [open, setOpen] = useState(false);

  if (open && !canDeclare) {
    setOpen(false);
    onExpire();
  }

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  return { open, handleOpen, handleClose };
}
