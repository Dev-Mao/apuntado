"use client";

import { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";

import { AppHeader, Pill } from "@/components";
import { ClosureDialog } from "@/features/closure";
import { cardId } from "@/lib";

import { useHand } from "../hooks";
import { TURN_PHASE } from "../types";
import { PlayerHand } from "./player-hand";
import { Scoreboard } from "./scoreboard";
import { TableFooter } from "./table-footer";
import { TableStage } from "./table-stage";
import { TurnActions } from "./turn-actions";
import { TurnStatus } from "./turn-status";

import type { TableScreenProps } from "../types";

export function TableScreen({ view, onDrawFromStock, onTakeFromDiscard, onDiscard, onSubmitClosure }: TableScreenProps) {
  const { t } = useTranslation();
  const hand = useHand(view.hand);
  const [closureOpen, setClosureOpen] = useState(false);
  const { turn } = view;
  const isMyTurn = turn.playerId === view.selfId;
  const activeName = view.opponents.find((opponent) => opponent.id === turn.playerId)?.name ?? "";
  const turnMessage =
    isMyTurn
      ? t(turn.phase === TURN_PHASE.DRAW ? "table.turn.draw" : "table.turn.discard")
      : t("table.turn.waiting", { name: activeName });

  const handleDiscard = useCallback(() => {
    const card = hand.cards.find((held) => hand.selectedIds.has(cardId(held)));
    if (card) onDiscard(card);
  }, [hand.cards, hand.selectedIds, onDiscard]);
  const handleOpenClosure = useCallback(() => setClosureOpen(true), []);
  const handleCloseClosure = useCallback(() => setClosureOpen(false), []);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip lg:grid lg:h-dvh lg:grid-cols-[minmax(0,1fr)_23rem] lg:overflow-hidden">
      <main className="flex flex-col lg:min-h-0">
        <AppHeader>
          <Pill>{t("table.title", { code: view.code })}</Pill>
        </AppHeader>
        <h1 className="sr-only">{t("table.title", { code: view.code })}</h1>
        <TableStage view={view} />
        <PlayerHand
          cards={hand.cards}
          selectedIds={hand.selectedIds}
          onToggle={hand.toggle}
          onMove={hand.move}
          onSortByRank={hand.handleSortByRank}
          onSortBySuit={hand.handleSortBySuit}
        />
      </main>
      <aside
        aria-label={t("table.round", { count: view.round })}
        className="flex flex-col gap-6 border-t border-line px-5 py-6 sm:px-8 lg:overflow-y-auto lg:border-t-0 lg:border-l lg:px-7"
      >
        <div>
          <p className="label-caps text-[0.65rem] text-coral-ink">{t(`gameMode.${view.mode}`)}</p>
          <p className="mt-1 font-display text-5xl leading-none">{t("table.round", { count: view.round })}</p>
        </div>
        <Scoreboard entries={view.scoreboard} threshold={view.eliminationThreshold} turnPlayerId={turn.playerId} />
        <div className="order-first flex flex-col gap-3 lg:order-none">
          <TurnStatus
            key={`${turn.playerId}-${turn.phase}`} message={turnMessage}
            secondsLeft={turn.secondsLeft}
            isMyTurn={isMyTurn}
          />
          <TurnActions
            allowedActions={view.allowedActions}
            canDiscard={hand.selectedIds.size === 1}
            onDrawFromStock={onDrawFromStock}
            onTakeFromDiscard={onTakeFromDiscard}
            onDiscard={handleDiscard}
            onDeclareClosure={handleOpenClosure}
          />
        </div>
        <TableFooter />
      </aside>
      <ClosureDialog
        open={closureOpen}
        cards={hand.cards}
        allowedClosureTypes={view.allowedClosureTypes}
        onClose={handleCloseClosure}
        onSubmit={onSubmitClosure}
      />
    </div>
  );
}
