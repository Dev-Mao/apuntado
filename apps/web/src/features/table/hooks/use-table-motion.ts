"use client";

import { useLayoutEffect, useRef } from "react";

import { motionAllowed } from "@/lib";

import { eventsBetween, frameOf } from "../motion-events";
import { measureHand, playEvents } from "../motion-player";

import type { MotionFrame } from "../motion-events";
import type { HandPlacements } from "../motion-player";
import type { PlayerView } from "@apuntado/contracts";

export function useTableMotion(view: PlayerView) {
  const frameRef = useRef<MotionFrame | null>(null);
  const handRef = useRef<HandPlacements>(new Map());

  useLayoutEffect(() => {
    const next = frameOf(view);
    const events = eventsBetween(frameRef.current, next);
    frameRef.current = next;
    if (motionAllowed()) playEvents(events, view, handRef.current);
  }, [view]);

  useLayoutEffect(() => {
    handRef.current = measureHand();
  });
}
