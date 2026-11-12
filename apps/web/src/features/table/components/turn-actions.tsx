"use client";

import { memo } from "react";

import { useTranslation } from "react-i18next";

import { Button, BUTTON_VARIANT } from "@/components";

import { useFocusRecovery } from "../hooks";

import type { TurnActionsProps } from "../types";
import type { PlayerAction } from "@apuntado/contracts";

function TurnActionsBase({
  allowedActions,
  pending,
  canDiscard,
  showLockedHint,
  notice,
  onFocusLost,
  onDrawFromStock,
  onDrawFromDiscard,
  onDiscard,
  onDeclareClosure,
}: TurnActionsProps) {
  const { t } = useTranslation();
  const { groupRef, handleFocus, handleBlur } = useFocusRecovery<HTMLDivElement>(allowedActions, onFocusLost);
  const isAllowed = (action: PlayerAction) => !pending && allowedActions.includes(action);

  return (
    <div className="flex flex-col">
      <div
        ref={groupRef}
        role="group"
        aria-label={t("table.actions.label")}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="grid grid-cols-2 gap-2 lg:grid-cols-1"
      >
        <Button onClick={onDrawFromStock} disabled={!isAllowed("DRAW_STOCK")}>
          {t("table.actions.draw")}
        </Button>
        <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onDrawFromDiscard} disabled={!isAllowed("DRAW_DISCARD")}>
          {t("table.actions.takeDiscard")}
        </Button>
        <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onDiscard} disabled={!isAllowed("DISCARD") || !canDiscard}>
          {t("table.actions.discard")}
        </Button>
        <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onDeclareClosure} disabled={!isAllowed("DECLARE_CLOSURE")}>
          {t("table.actions.declareClosure")}
        </Button>
      </div>
      <p aria-live="polite" className="font-display text-sm text-ink-soft italic not-empty:mt-3">
        {showLockedHint ? t("table.actions.lockedHint") : notice}
      </p>
    </div>
  );
}

export const TurnActions = memo(TurnActionsBase);
