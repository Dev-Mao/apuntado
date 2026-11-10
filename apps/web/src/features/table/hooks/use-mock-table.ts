"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CLOSURE_REJECTION } from "@/features/closure";
import { cardId } from "@/lib";

import { MOCK_STOCK_DRAWS, MOCK_UNDER_DISCARD } from "../mock-data";
import { PLAYER_ACTION, TURN_PHASE } from "../types";

import type { TableActions, TableView } from "../types";
import type { ClosureResponse } from "@/features/closure";
import type { CardDto } from "@apuntado/contracts";

const MOCK_LATENCY_MS = 600;
const MOCK_OPPONENT_TURN_MS = 3000;
const MOCK_TURN_SECONDS = 60;

const DRAW_ACTIONS = [PLAYER_ACTION.DRAW_STOCK, PLAYER_ACTION.TAKE_DISCARD];
const DISCARD_ACTIONS = [PLAYER_ACTION.DISCARD, PLAYER_ACTION.DECLARE_CLOSURE];

const REJECTED: ClosureResponse = {
  status: "REJECTED",
  rejection: { code: CLOSURE_REJECTION.LEFTOVER_TOO_HIGH, sum: 6, limit: 5 },
};
const ACCEPTED: ClosureResponse = { status: "ACCEPTED" };

function isInPlay(view: TableView, card: CardDto): boolean {
  const id = cardId(card);
  return view.hand.some((held) => cardId(held) === id) || (view.discardTop !== null && cardId(view.discardTop) === id);
}

function withCardInHand(view: TableView, card: CardDto, changes: Partial<TableView>): TableView {
  return {
    ...view,
    ...changes,
    hand: [...view.hand, card],
    turn: { ...view.turn, phase: TURN_PHASE.DISCARD },
    allowedActions: DISCARD_ACTIONS,
  };
}

export function useMockTable(initialView: TableView): { view: TableView } & TableActions {
  const [view, setView] = useState(initialView);
  const closureAttemptsRef = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const onDrawFromStock = useCallback(() => {
    setView((prev) => {
      const card = MOCK_STOCK_DRAWS.find((candidate) => !isInPlay(prev, candidate));
      return card ? withCardInHand(prev, card, { stockCount: prev.stockCount - 1 }) : prev;
    });
  }, []);

  const onTakeFromDiscard = useCallback(() => {
    setView((prev) => {
      if (!prev.discardTop) return prev;
      const next = isInPlay(prev, MOCK_UNDER_DISCARD) ? null : MOCK_UNDER_DISCARD;
      return withCardInHand(prev, prev.discardTop, { discardTop: next });
    });
  }, []);

  const onDiscard = useCallback((card: CardDto) => {
    setView((prev) => ({
      ...prev,
      hand: prev.hand.filter((held) => cardId(held) !== cardId(card)),
      discardTop: card,
      turn: { playerId: prev.opponents[0]?.id ?? prev.selfId, phase: TURN_PHASE.DRAW, secondsLeft: MOCK_TURN_SECONDS },
      allowedActions: [],
    }));
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setView((prev) => ({
        ...prev,
        turn: { playerId: prev.selfId, phase: TURN_PHASE.DRAW, secondsLeft: MOCK_TURN_SECONDS },
        allowedActions: DRAW_ACTIONS,
      }));
    }, MOCK_OPPONENT_TURN_MS);
  }, []);

  const onSubmitClosure = useCallback(() => {
    closureAttemptsRef.current += 1;
    const response = closureAttemptsRef.current === 1 ? REJECTED : ACCEPTED;
    return new Promise<ClosureResponse>((resolve) => window.setTimeout(() => resolve(response), MOCK_LATENCY_MS));
  }, []);

  return { view, onDrawFromStock, onTakeFromDiscard, onDiscard, onSubmitClosure };
}
