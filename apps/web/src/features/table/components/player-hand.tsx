"use client";

import { memo, useCallback, useMemo } from "react";

import { useTranslation } from "react-i18next";

import { cardId } from "@/lib";

import { fanStyles } from "../fan-layout";
import { useHandDrag } from "../hooks";
import { HAND_HELP_ID, HandCard } from "./hand-card";
import { HandGroupsBar } from "./hand-groups-bar";

import type { PlayerHandProps } from "../types";
import type { CardDto } from "@apuntado/contracts";
import type { CSSProperties } from "react";

const HAND_SPREAD_DEG = 1.8;
const HAND_ARC_PX = 0.55;
const EMPTY_STYLE = {};
const SORT_CLASSES =
  "label-caps min-h-8 rounded-full border-[1.5px] border-ink/25 px-3 pt-[0.45rem] pb-[0.35rem] text-[0.6rem] whitespace-nowrap text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper";

function startsGroup(cards: readonly CardDto[], groupOf: ReadonlyMap<string, number>, index: number): boolean {
  const current = cards[index];
  const previous = cards[index - 1];
  if (!current || !previous) return false;
  return groupOf.get(cardId(current)) !== groupOf.get(cardId(previous));
}

function PlayerHandBase({ cards, selectedIds, lockedId, groups, groupOf, canGroup, onToggle, onMove, onGroup, onUngroup, onSortByRank, onSortBySuit }: PlayerHandProps) {
  const { t } = useTranslation();
  const drag = useHandDrag(onMove, cards.length);
  const styles = useMemo(() => fanStyles(cards.length, HAND_SPREAD_DEG, HAND_ARC_PX), [cards.length]);
  const fanVars = useMemo(() => ({ "--n": cards.length }) as CSSProperties, [cards.length]);
  const { consumeSuppressedClick } = drag;

  const handleToggle = useCallback(
    (id: string) => {
      if (!consumeSuppressedClick()) onToggle(id);
    },
    [consumeSuppressedClick, onToggle],
  );

  return (
    <section aria-labelledby="hand-title" className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 id="hand-title" className="label-caps text-[0.65rem] whitespace-nowrap">
            {t("table.hand.label")}
          </h2>
          {selectedIds.size > 0 && (
            <span aria-hidden="true" className="grid size-5 animate-spark place-items-center rounded-full bg-coral text-sm leading-none tabular-nums lining-nums">
              {selectedIds.size}
            </span>
          )}
          <span aria-live="polite" className="sr-only">
            {selectedIds.size > 0 ? t("table.hand.selected", { count: selectedIds.size }) : ""}
          </span>
        </div>
        <div role="group" aria-label={t("table.hand.sortLabel")} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="mr-1 hidden text-sm whitespace-nowrap text-ink-soft italic sm:inline">
            {t("table.hand.sortLabel")}
          </span>
          <button type="button" onClick={onSortByRank} className={SORT_CLASSES}>
            {t("table.hand.sortByRank")}
          </button>
          <button type="button" onClick={onSortBySuit} className={SORT_CLASSES}>
            {t("table.hand.sortBySuit")}
          </button>
        </div>
      </div>
      <HandGroupsBar groups={groups} canGroup={canGroup} selectedCount={selectedIds.size} onGroup={onGroup} onUngroup={onUngroup} />
      <p id={HAND_HELP_ID} className="sr-only">
        {t("table.hand.instructions")}
      </p>
      <ul style={fanVars} className="hand-fan flex justify-center px-3 pt-8 pb-9 short:pt-5 short:pb-7 sm:pt-10 lg:pb-6 lg:short:pt-7">
        {cards.map((card, index) => {
          const group = groupOf.get(cardId(card)) ?? null;
          return (
          <HandCard
            key={cardId(card)}
            card={card}
            index={index}
            isSelected={selectedIds.has(cardId(card))}
            isLocked={lockedId === cardId(card)}
            isDragging={drag.draggingIndex === index}
            group={group}
            groupStart={startsGroup(cards, groupOf, index)}
            fanStyle={styles[index] ?? EMPTY_STYLE}
            onToggle={handleToggle}
            onKeyDown={drag.handleKeyDown}
            onPointerDown={drag.handlePointerDown}
            onPointerMove={drag.handlePointerMove}
            onPointerUp={drag.handlePointerUp}
            onPointerCancel={drag.handlePointerCancel}
          />
          );
        })}
      </ul>
    </section>
  );
}

export const PlayerHand = memo(PlayerHandBase);
