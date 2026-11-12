"use client";

import { useTranslation } from "react-i18next";

import { Dialog } from "@/components";
import { ClosureDialog } from "@/features/closure";

import { useTableScreen } from "../hooks";
import { PlayerHand } from "./player-hand";
import { RulesDialog } from "./rules-dialog";
import { ScoreStrip } from "./score-strip";
import { Scoreboard } from "./scoreboard";
import { TableBackdrop } from "./table-backdrop";
import { TableHeader } from "./table-header";
import { TableSidebar } from "./table-sidebar";
import { TableStage } from "./table-stage";
import { TurnActions } from "./turn-actions";
import { TurnPanel } from "./turn-panel";
import { TurnTimer } from "./turn-timer";

import type { TableScreenProps } from "../types";

export function TableScreen(props: TableScreenProps) {
  const { t } = useTranslation();
  const { snapshot, onDeclareClosure } = props;
  const { view, seats } = snapshot;
  const screen = useTableScreen(props);
  const { hand, panels, closure, piles, turn } = screen;
  const scoreboard = {
    entries: view.scoreboard,
    seats,
    threshold: view.eliminationThreshold,
    selfId: view.playerId,
    turnPlayerId: view.currentPlayerId,
  };
  const turnPanel = {
    isMine: turn.isMine,
    message: turn.message,
    waitingFor: turn.waitingFor,
    notice: turn.notice,
    turnKey: view.currentPlayerId ?? "",
    turnDeadline: view.turnDeadline,
    serverTime: view.serverTime,
  };

  return (
    <div className="relative isolate grid min-h-dvh grid-rows-[auto_auto_minmax(0,1fr)_auto] overflow-clip lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_minmax(0,1fr)_auto] [@media(min-height:44rem)]:h-dvh">
      <TableBackdrop />
      <TableHeader code={snapshot.code} round={view.roundNumber} onShowRules={panels.showRules} onShowScores={panels.showScores} />
      <ScoreStrip entries={view.scoreboard} seats={seats} selfId={view.playerId} turnPlayerId={view.currentPlayerId} onOpen={panels.showScores} />
      <span
        aria-hidden="true"
        className="col-start-1 row-start-3 mx-3 rounded-[2rem] bg-ink shadow-sheet sm:mx-6 lg:row-span-2 lg:row-start-2 lg:mx-0 lg:ml-8 lg:rounded-tl-[16rem] lg:rounded-tr-none lg:rounded-br-none lg:rounded-bl-[7rem]"
      />
      <div className="col-start-1 row-start-3 mx-3 grid min-h-0 sm:mx-6 lg:row-start-2 lg:mx-0 lg:ml-8">
        <TableStage snapshot={snapshot} selfName={screen.selfName} stockAction={piles.stockAction} discardAction={piles.discardAction} />
      </div>
      <div className="relative col-start-1 row-start-4 flex flex-col gap-3 overflow-x-clip px-3 pt-5 sm:px-6 lg:row-start-3 lg:ml-8 lg:px-12 lg:pt-8">
        <span aria-hidden="true" className="absolute -inset-x-[70%] top-0 -bottom-[120%] rounded-[50%] bg-paper-light shadow-[0_-1px_0_var(--color-line)]" />
        <div className="relative flex flex-col gap-3 lg:hidden">
          <TurnPanel {...turnPanel} />
          <TurnActions layout="row" {...screen.actions} />
        </div>
        <div className="relative">
          <PlayerHand
          cards={hand.cards}
          selectedIds={hand.selectedIds}
          lockedId={screen.lockedId}
          onToggle={hand.toggle}
          onMove={hand.move}
          onSortByRank={hand.handleSortByRank}
          onSortBySuit={hand.handleSortBySuit}
          />
        </div>
      </div>
      <TableSidebar
        round={view.roundNumber}
        mode={view.mode}
        code={snapshot.code}
        enabledClosures={view.enabledClosures}
        scoreboard={scoreboard}
        turn={<TurnPanel {...turnPanel} />}
        actions={<TurnActions layout="stack" {...screen.actions} />}
      />
      <Dialog open={panels.scoresOpen} title={t("table.scoreboard.title")} closeLabel={t("common.close")} onClose={panels.close}>
        {panels.scoresOpen && (
          <div className="mt-4">
            <Scoreboard {...scoreboard} bandClassName="-mx-5 px-5 sm:-mx-9 sm:px-9" />
          </div>
        )}
      </Dialog>
      <RulesDialog open={panels.rulesOpen} threshold={view.eliminationThreshold} onClose={panels.close} />
      <ClosureDialog
        key={closure.attempt}
        open={closure.open}
        cards={hand.cards}
        enabledClosures={view.enabledClosures}
        cannotDiscard={view.cannotDiscard}
        timer={
          <TurnTimer
            turnDeadline={view.turnDeadline}
            serverTime={view.serverTime}
            className="text-2xl"
            unitClassName="text-ink-soft"
            urgentClassName="text-coral-ink"
          />
        }
        onClose={closure.handleClose}
        onSubmit={onDeclareClosure}
      />
    </div>
  );
}
