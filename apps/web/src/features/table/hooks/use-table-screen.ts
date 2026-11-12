"use client";

import { useCallback } from "react";

import { useTranslation } from "react-i18next";

import { useCommandNotice } from "@/hooks/use-command-notice";
import { cardId, nicknameOf } from "@/lib";

import { useClosurePrompt } from "./use-closure-prompt";
import { useHand } from "./use-hand";
import { usePileActions } from "./use-pile-actions";
import { useTableMotion } from "./use-table-motion";
import { useTablePanels } from "./use-table-panels";
import { useTurnMessage } from "./use-turn-message";

import type { TableScreenProps } from "../types";

function focusHand() {
  document.querySelector<HTMLElement>("[data-hand-index='0']")?.focus();
}

export function useTableScreen({ snapshot, pending, onDrawFromStock, onDrawFromDiscard, onDiscard }: TableScreenProps) {
  const { t } = useTranslation();
  const { view, seats } = snapshot;
  const hand = useHand(view.hand);
  const panels = useTablePanels();
  const turnMessage = useTurnMessage(snapshot);
  const { notice, run, show } = useCommandNotice();
  const closure = useClosurePrompt(view.allowedActions.includes("DECLARE_CLOSURE"), () =>
    show(t("table.actions.closureExpired")),
  );
  const lockedId = view.cannotDiscard ? cardId(view.cannotDiscard) : null;
  const selectedIsLocked = lockedId !== null && hand.selectedIds.has(lockedId);
  const canDiscard = hand.selectedIds.size === 1 && !selectedIsLocked;
  const { clearSelection } = hand;
  useTableMotion(view);

  const handleDiscard = useCallback(() => {
    const card = hand.cards.find((held) => hand.selectedIds.has(cardId(held)));
    if (!card) return;
    clearSelection();
    void run(() => onDiscard(card));
  }, [hand.cards, hand.selectedIds, clearSelection, run, onDiscard]);
  const handleDrawFromStock = useCallback(() => void run(onDrawFromStock), [run, onDrawFromStock]);
  const handleDrawFromDiscard = useCallback(() => void run(onDrawFromDiscard), [run, onDrawFromDiscard]);
  const piles = usePileActions({
    allowedActions: view.allowedActions,
    pending,
    canDiscard,
    onDrawFromStock: handleDrawFromStock,
    onDrawFromDiscard: handleDrawFromDiscard,
    onDiscard: handleDiscard,
  });

  return {
    hand,
    panels,
    closure,
    piles,
    lockedId,
    canDiscard,
    selfName: nicknameOf(seats, view.playerId),
    turn: {
      isMine: view.currentPlayerId === view.playerId,
      message: turnMessage,
      waitingFor: nicknameOf(seats, view.currentPlayerId),
      notice: selectedIsLocked ? t("table.actions.lockedHint") : notice,
    },
    actions: {
      allowedActions: view.allowedActions,
      pending,
      canDiscard,
      onFocusLost: focusHand,
      onDrawFromStock: handleDrawFromStock,
      onDrawFromDiscard: handleDrawFromDiscard,
      onDiscard: handleDiscard,
      onDeclareClosure: closure.handleOpen,
    },
  };
}
