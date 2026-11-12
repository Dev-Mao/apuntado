"use client";

import { useMemo } from "react";

import { useTranslation } from "react-i18next";

import type { PileAction } from "../types";
import type { PlayerAction } from "@apuntado/contracts";

interface PileActionsInput {
  allowedActions: readonly PlayerAction[];
  pending: boolean;
  canDiscard: boolean;
  onDrawFromStock: () => void;
  onDrawFromDiscard: () => void;
  onDiscard: () => void;
}

export function usePileActions({ allowedActions, pending, canDiscard, onDrawFromStock, onDrawFromDiscard, onDiscard }: PileActionsInput) {
  const { t } = useTranslation();

  return useMemo(() => {
    const allowed = (action: PlayerAction) => !pending && allowedActions.includes(action);
    const takeDiscard: PileAction | null = allowed("DRAW_DISCARD") ? { label: t("table.actions.takeDiscard"), onPress: onDrawFromDiscard } : null;
    const dropOnDiscard: PileAction | null =
      allowed("DISCARD") && canDiscard ? { label: t("table.actions.discardOnPile"), onPress: onDiscard } : null;
    return {
      stockAction: allowed("DRAW_STOCK") ? { label: t("table.actions.draw"), onPress: onDrawFromStock } : null,
      discardAction: takeDiscard ?? dropOnDiscard,
    };
  }, [allowedActions, pending, canDiscard, onDrawFromStock, onDrawFromDiscard, onDiscard, t]);
}
