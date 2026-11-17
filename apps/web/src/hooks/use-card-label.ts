"use client";

import { useCallback } from "react";

import { useTranslation } from "react-i18next";

import { isJoker, isRedSuit } from "@/lib";

import type { CardDto } from "@apuntado/contracts";

export function useCardLabel(): (card: CardDto) => string {
  const { t } = useTranslation();
  return useCallback(
    (card: CardDto) =>
      isJoker(card)
        ? t(isRedSuit(card.suit) ? "cards.joker.red" : "cards.joker.black")
        : t("cards.label", { rank: t(`cards.rank.${card.rank}`), suit: t(`cards.suit.${card.suit}`) }),
    [t],
  );
}
