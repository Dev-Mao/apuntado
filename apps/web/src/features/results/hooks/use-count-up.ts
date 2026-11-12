"use client";

import { useEffect, useRef, useState } from "react";

import { motionAllowed } from "@/lib";

const COUNT_MS = 900;

export function useCountUp(target: number, delayMs = 0): number {
  const [value, setValue] = useState(() => (typeof document !== "undefined" && !motionAllowed() ? target : 0));
  const shownRef = useRef(value);

  useEffect(() => {
    const show = (next: number) => {
      shownRef.current = next;
      setValue(next);
    };
    if (!motionAllowed()) {
      const frame = requestAnimationFrame(() => show(target));
      return () => cancelAnimationFrame(frame);
    }
    let frame = 0;
    const from = shownRef.current;
    const start = performance.now() + delayMs;
    const tick = (now: number) => {
      const progress = Math.min(Math.max((now - start) / COUNT_MS, 0), 1);
      show(Math.round(from + (target - from) * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, delayMs]);

  return value;
}
