"use client";

import { useTranslation } from "react-i18next";

import { nicknameOf } from "@/lib";

import type { TableSnapshot } from "@apuntado/contracts";

export function useTurnMessage({ view, seats }: TableSnapshot): string {
  const { t } = useTranslation();
  if (view.status === "FINISHED") return t("table.turn.finished");
  if (view.status === "ROUND_OVER") return t("table.turn.roundOver");
  if (view.currentPlayerId !== view.playerId) {
    return t("table.turn.waiting", { name: nicknameOf(seats, view.currentPlayerId) });
  }
  return t(view.phase === "DISCARD" ? "table.turn.discard" : "table.turn.draw");
}
