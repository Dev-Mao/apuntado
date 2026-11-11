"use client";

import { useCallback, useEffect, useRef } from "react";

import type { FocusEvent } from "react";

function isFocusLost(group: HTMLElement): boolean {
  const active = document.activeElement;
  if (active === null || active === document.body) return true;
  return active instanceof HTMLButtonElement && active.disabled && group.contains(active);
}

export function useFocusRecovery<T extends HTMLElement>(trigger: unknown, onFocusLost: () => void) {
  const groupRef = useRef<T>(null);
  const hadFocusRef = useRef(false);

  const handleFocus = useCallback(() => {
    hadFocusRef.current = true;
  }, []);

  const handleBlur = useCallback((event: FocusEvent<T>) => {
    if (event.relatedTarget !== null) hadFocusRef.current = false;
  }, []);

  useEffect(() => {
    const group = groupRef.current;
    if (!group || !hadFocusRef.current || !isFocusLost(group)) return;
    hadFocusRef.current = false;
    onFocusLost();
  }, [trigger, onFocusLost]);

  return { groupRef, handleFocus, handleBlur };
}
