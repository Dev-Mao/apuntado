"use client";

import { useEffect, useState } from "react";

const TICK_MS = 1000;

interface Countdown {
  readonly deadline: string;
  readonly secondsLeft: number;
}

function secondsUntil(deadlineMs: number, offsetMs: number): number {
  return Math.max(0, Math.ceil((deadlineMs - (Date.now() + offsetMs)) / TICK_MS));
}

export function useTurnCountdown(turnDeadline: string | null, serverTime: string): number | null {
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  useEffect(() => {
    if (turnDeadline === null) return;
    const offsetMs = Date.parse(serverTime) - Date.now();
    const deadlineMs = Date.parse(turnDeadline);
    const tick = () => {
      const secondsLeft = secondsUntil(deadlineMs, offsetMs);
      setCountdown({ deadline: turnDeadline, secondsLeft });
      return secondsLeft;
    };
    if (tick() === 0) return;
    const timer = window.setInterval(() => {
      if (tick() === 0) window.clearInterval(timer);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [turnDeadline, serverTime]);

  if (turnDeadline === null || countdown?.deadline !== turnDeadline) return null;
  return countdown.secondsLeft;
}
