"use client";

import { useCallback } from "react";

import { useTranslation } from "react-i18next";

import type { CardDto } from "@apuntado/contracts";

export function useCardLabel(): (card: CardDto) => string {
  const { t } = useTranslation();
  return useCallback(
    (card: CardDto) => t("cards.label", { rank: t(`cards.rank.${card.rank}`), suit: t(`cards.suit.${card.suit}`) }),
    [t],
  );
}
