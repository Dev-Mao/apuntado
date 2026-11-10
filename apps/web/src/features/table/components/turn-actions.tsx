"use client";

import { memo } from "react";

import { useTranslation } from "react-i18next";

import { Button, BUTTON_VARIANT } from "@/components";

import { PLAYER_ACTION } from "../types";

import type { TurnActionsProps } from "../types";

function TurnActionsBase({
  allowedActions,
  canDiscard,
  onDrawFromStock,
  onTakeFromDiscard,
  onDiscard,
  onDeclareClosure,
}: TurnActionsProps) {
  const { t } = useTranslation();
  const isAllowed = (action: (typeof PLAYER_ACTION)[keyof typeof PLAYER_ACTION]) => allowedActions.includes(action);

  return (
    <div role="group" aria-label={t("table.actions.label")} className="grid grid-cols-2 gap-2 lg:grid-cols-1">
      <Button onClick={onDrawFromStock} disabled={!isAllowed(PLAYER_ACTION.DRAW_STOCK)}>
        {t("table.actions.draw")}
      </Button>
      <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onTakeFromDiscard} disabled={!isAllowed(PLAYER_ACTION.TAKE_DISCARD)}>
        {t("table.actions.takeDiscard")}
      </Button>
      <Button
        variant={BUTTON_VARIANT.OUTLINE}
        onClick={onDiscard}
        disabled={!isAllowed(PLAYER_ACTION.DISCARD) || !canDiscard}
      >
        {t("table.actions.discard")}
      </Button>
      <Button
        variant={BUTTON_VARIANT.OUTLINE}
        onClick={onDeclareClosure}
        disabled={!isAllowed(PLAYER_ACTION.DECLARE_CLOSURE)}
      >
        {t("table.actions.declareClosure")}
      </Button>
    </div>
  );
}

export const TurnActions = memo(TurnActionsBase);
