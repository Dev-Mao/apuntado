"use client";

import { useEffect, useState } from "react";

import { motionAllowed } from "@/lib";

const COUNT_MS = 900;

export function useCountUp(target: number, delayMs = 0): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!motionAllowed()) {
      const frame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame);
    }
    let frame = 0;
    const start = performance.now() + delayMs;
    const tick = (now: number) => {
      const progress = Math.min(Math.max((now - start) / COUNT_MS, 0), 1);
      setValue(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, delayMs]);

  return value;
}
