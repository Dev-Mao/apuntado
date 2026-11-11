"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { discard, drawFromDiscard, drawFromStock, endRound, returnTurn, startTurn } from "../mock-server";

import type { TableActions } from "../types";
import type { ActionResult, CardDto, PlayerView, TableSnapshot } from "@apuntado/contracts";

const MOCK_LATENCY_MS = 600;
const MOCK_OPPONENT_TURN_MS = 3000;

const REJECTED: ActionResult = { ok: false, reason: "Las cartas sobrantes suman 6; deben sumar menos de 5" };
const ACCEPTED: ActionResult = { ok: true };

type ViewChange = (view: PlayerView, now: number) => PlayerView;

function freshSnapshot(initial: TableSnapshot): TableSnapshot {
  return { ...initial, view: startTurn(initial.view, initial.view.playerId, Date.now()) };
}

export function useMockTable(initial: TableSnapshot): { snapshot: TableSnapshot } & TableActions {
  const [snapshot, setSnapshot] = useState(() => freshSnapshot(initial));
  const closureAttemptsRef = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const update = useCallback((change: ViewChange) => {
    const now = Date.now();
    setSnapshot((prev) => ({ ...prev, view: change(prev.view, now) }));
  }, []);

  const onDrawFromStock = useCallback(() => update(drawFromStock), [update]);
  const onDrawFromDiscard = useCallback(() => update(drawFromDiscard), [update]);

  const onDiscard = useCallback(
    (card: CardDto) => {
      update((view, now) => discard(view, card, now));
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => update(returnTurn), MOCK_OPPONENT_TURN_MS);
    },
    [update],
  );

  const onDeclareClosure = useCallback(() => {
    closureAttemptsRef.current += 1;
    const response = closureAttemptsRef.current === 1 ? REJECTED : ACCEPTED;
    return new Promise<ActionResult>((resolve) =>
      window.setTimeout(() => {
        if (response.ok) update(endRound);
        resolve(response);
      }, MOCK_LATENCY_MS),
    );
  }, [update]);

  return { snapshot, onDrawFromStock, onDrawFromDiscard, onDiscard, onDeclareClosure };
}
