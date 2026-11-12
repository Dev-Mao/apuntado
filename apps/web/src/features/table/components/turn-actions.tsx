"use client";

import { memo } from "react";

import { useTranslation } from "react-i18next";

import { Button, BUTTON_VARIANT } from "@/components";
import { cn } from "@/lib";

import { useFocusRecovery } from "../hooks";

import type { TurnActionsProps } from "../types";
import type { PlayerAction } from "@apuntado/contracts";

const ACTION_LABELS = {
  DRAW_STOCK: "table.actions.draw",
  DRAW_DISCARD: "table.actions.takeDiscard",
  DISCARD: "table.actions.discard",
  DECLARE_CLOSURE: "table.actions.declareClosure",
} as const satisfies Record<PlayerAction, string>;

const ACTION_ORDER: readonly PlayerAction[] = ["DRAW_STOCK", "DRAW_DISCARD", "DISCARD", "DECLARE_CLOSURE"];

function TurnActionsBase({
  layout,
  allowedActions,
  pending,
  canDiscard,
  onFocusLost,
  onDrawFromStock,
  onDrawFromDiscard,
  onDiscard,
  onDeclareClosure,
}: TurnActionsProps) {
  const { t } = useTranslation();
  const { groupRef, handleFocus, handleBlur } = useFocusRecovery<HTMLDivElement>(allowedActions, onFocusLost);
  const handlers: Readonly<Record<PlayerAction, () => void>> = {
    DRAW_STOCK: onDrawFromStock,
    DRAW_DISCARD: onDrawFromDiscard,
    DISCARD: onDiscard,
    DECLARE_CLOSURE: onDeclareClosure,
  };
  const visible = ACTION_ORDER.filter((action) => allowedActions.includes(action));

  return (
    <div
      ref={groupRef}
      role="group"
      aria-label={t("table.actions.label")}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn("flex gap-2 empty:hidden", layout === "stack" ? "flex-col" : "flex-row")}
    >
      {visible.map((action, index) => (
        <Button
          key={action}
          variant={index === 0 ? BUTTON_VARIANT.PRIMARY : BUTTON_VARIANT.OUTLINE}
          onClick={handlers[action]}
          disabled={pending || (action === "DISCARD" && !canDiscard)}
          className={cn("animate-turn-in", layout === "stack" ? "w-full" : "flex-1 px-3")}
        >
          {t(ACTION_LABELS[action])}
        </Button>
      ))}
    </div>
  );
}

export const TurnActions = memo(TurnActionsBase);
