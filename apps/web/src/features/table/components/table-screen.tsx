"use client";

import { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";

import { AppHeader, Pill } from "@/components";
import { ClosureDialog } from "@/features/closure";
import { useCommandNotice } from "@/hooks/use-command-notice";
import { cardId } from "@/lib";

import { useHand, useTurnMessage } from "../hooks";
import { PlayerHand } from "./player-hand";
import { Scoreboard } from "./scoreboard";
import { TableFooter } from "./table-footer";
import { TableStage } from "./table-stage";
import { TurnActions } from "./turn-actions";
import { TurnStatus } from "./turn-status";

import type { TableScreenProps } from "../types";

function focusHand() {
  document.querySelector<HTMLElement>("[data-hand-index='0']")?.focus();
}

export function TableScreen({ snapshot, onDrawFromStock, onDrawFromDiscard, onDiscard, onDeclareClosure }: TableScreenProps) {
  const { t } = useTranslation();
  const { view } = snapshot;
  const hand = useHand(view.hand);
  const turnMessage = useTurnMessage(snapshot);
  const [closureOpen, setClosureOpen] = useState(false);
  const { notice, run } = useCommandNotice();
  const isMyTurn = view.currentPlayerId === view.playerId;
  const lockedId = view.cannotDiscard ? cardId(view.cannotDiscard) : null;
  const selectedIsLocked = lockedId !== null && hand.selectedIds.has(lockedId);
  const { clearSelection } = hand;

  const handleDiscard = useCallback(() => {
    const card = hand.cards.find((held) => hand.selectedIds.has(cardId(held)));
    if (!card) return;
    clearSelection();
    void run(() => onDiscard(card));
  }, [hand.cards, hand.selectedIds, clearSelection, run, onDiscard]);
  const handleDrawFromStock = useCallback(() => void run(onDrawFromStock), [run, onDrawFromStock]);
  const handleDrawFromDiscard = useCallback(() => void run(onDrawFromDiscard), [run, onDrawFromDiscard]);
  const handleOpenClosure = useCallback(() => setClosureOpen(true), []);
  const handleCloseClosure = useCallback(() => setClosureOpen(false), []);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip lg:grid lg:h-dvh lg:grid-cols-[minmax(0,1fr)_23rem] lg:overflow-hidden">
      <main className="flex flex-col lg:min-h-0">
        <AppHeader>
          <Pill>{t("table.title", { code: snapshot.code })}</Pill>
        </AppHeader>
        <h1 className="sr-only">{t("table.title", { code: snapshot.code })}</h1>
        <TableStage snapshot={snapshot} />
        <PlayerHand
          cards={hand.cards}
          selectedIds={hand.selectedIds}
          lockedId={lockedId}
          onToggle={hand.toggle}
          onMove={hand.move}
          onSortByRank={hand.handleSortByRank}
          onSortBySuit={hand.handleSortBySuit}
        />
      </main>
      <aside
        aria-label={t("table.round", { count: view.roundNumber })}
        className="flex flex-col gap-6 border-t border-line px-5 py-6 sm:px-8 lg:overflow-y-auto lg:border-t-0 lg:border-l lg:px-7"
      >
        <div>
          <p className="label-caps text-[0.65rem] text-coral-ink">{t(`gameMode.${view.mode}`)}</p>
          <p className="mt-1 font-display text-5xl leading-none">{t("table.round", { count: view.roundNumber })}</p>
        </div>
        <Scoreboard
          entries={view.scoreboard}
          seats={snapshot.seats}
          threshold={view.eliminationThreshold}
          turnPlayerId={view.currentPlayerId}
        />
        <div className="order-first flex flex-col gap-3 lg:order-none">
          <TurnStatus message={turnMessage} turnDeadline={view.turnDeadline} serverTime={view.serverTime} isMyTurn={isMyTurn} />
          <TurnActions
            allowedActions={view.allowedActions}
            canDiscard={hand.selectedIds.size === 1 && !selectedIsLocked}
            showLockedHint={selectedIsLocked}
            notice={notice}
            onFocusLost={focusHand}
            onDrawFromStock={handleDrawFromStock}
            onDrawFromDiscard={handleDrawFromDiscard}
            onDiscard={handleDiscard}
            onDeclareClosure={handleOpenClosure}
          />
        </div>
        <TableFooter threshold={view.eliminationThreshold} />
      </aside>
      <ClosureDialog
        open={closureOpen}
        cards={hand.cards}
        enabledClosures={view.enabledClosures}
        cannotDiscard={view.cannotDiscard}
        onClose={handleCloseClosure}
        onSubmit={onDeclareClosure}
      />
    </div>
  );
}
