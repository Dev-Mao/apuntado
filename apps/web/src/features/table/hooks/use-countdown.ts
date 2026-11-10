"use client";

import { useEffect, useState } from "react";

const TICK_MS = 1000;

export function useCountdown(seconds: number): number {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const timer = window.setInterval(() => setLeft((prev) => Math.max(prev - 1, 0)), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  return left;
}
