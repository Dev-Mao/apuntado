"use client";

import { useEffect, useRef } from "react";

import { playSound } from "@/lib";

import { eventsBetween, frameOf } from "../motion-events";

import type { MotionEvent, MotionFrame } from "../motion-events";
import type { SoundEffect } from "@/lib";
import type { PlayerView } from "@apuntado/contracts";

const EVENT_SOUND: Record<MotionEvent["kind"], SoundEffect> = {
  deal: "deal",
  selfDraw: "draw",
  rivalDraw: "draw",
  selfDiscard: "discard",
  rivalDiscard: "discard",
};

export function useTableSounds(view: PlayerView) {
  const frameRef = useRef<MotionFrame | null>(null);
  const turnRef = useRef<string | null>(null);

  useEffect(() => {
    const next = frameOf(view);
    const events = eventsBetween(frameRef.current, next);
    frameRef.current = next;
    events.forEach((event) => playSound(EVENT_SOUND[event.kind]));
    const myTurn = view.currentPlayerId === view.playerId;
    if (myTurn && turnRef.current !== view.playerId && events.every((event) => event.kind !== "deal")) playSound("turn");
    turnRef.current = view.currentPlayerId;
  }, [view]);
}
