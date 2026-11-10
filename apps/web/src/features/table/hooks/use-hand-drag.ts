"use client";

import { useCallback, useRef, useState } from "react";

import type { DragState } from "../types";
import type { KeyboardEvent, PointerEvent } from "react";

const DRAG_THRESHOLD_PX = 6;
const HAND_INDEX_SELECTOR = "[data-hand-index]";

function focusCard(id: string) {
  requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-card-id="${id}"]`)?.focus());
}

export function useHandDrag(onMove: (from: number, to: number) => void, cardCount: number) {
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const index = Number(event.currentTarget.dataset.handIndex);
    dragRef.current = { index, startX: event.clientX, startY: event.clientY, active: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (!drag.active) {
        const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
        if (distance < DRAG_THRESHOLD_PX) return;
        drag.active = true;
        setDraggingIndex(drag.index);
      }
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>(HAND_INDEX_SELECTOR);
      const to = Number(target?.dataset.handIndex ?? Number.NaN);
      if (Number.isNaN(to) || to === drag.index) return;
      onMove(drag.index, to);
      dragRef.current = { ...drag, index: to };
      setDraggingIndex(to);
    },
    [onMove],
  );

  const handlePointerUp = useCallback(() => {
    suppressClickRef.current = dragRef.current?.active ?? false;
    dragRef.current = null;
    setDraggingIndex(null);
  }, []);

  const consumeSuppressedClick = useCallback(() => {
    const suppressed = suppressClickRef.current;
    suppressClickRef.current = false;
    return suppressed;
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (!event.altKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
      event.preventDefault();
      const from = Number(event.currentTarget.dataset.handIndex);
      const to = Math.min(Math.max(from + (event.key === "ArrowLeft" ? -1 : 1), 0), cardCount - 1);
      if (to === from) return;
      onMove(from, to);
      const id = event.currentTarget.dataset.cardId;
      if (id) focusCard(id);
    },
    [onMove, cardCount],
  );

  return { draggingIndex, handlePointerDown, handlePointerMove, handlePointerUp, handleKeyDown, consumeSuppressedClick };
}
