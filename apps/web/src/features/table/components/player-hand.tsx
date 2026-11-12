"use client";

import { memo, useCallback, useMemo } from "react";

import { useTranslation } from "react-i18next";

import { cardId } from "@/lib";

import { fanStyles } from "../fan-layout";
import { useHandDrag } from "../hooks";
import { HAND_HELP_ID, HandCard } from "./hand-card";

import type { PlayerHandProps } from "../types";
import type { CSSProperties } from "react";

const HAND_SPREAD_DEG = 1.8;
const HAND_ARC_PX = 0.55;
const EMPTY_STYLE = {};
const SORT_CLASSES =
  "label-caps min-h-9 rounded-full px-3 pt-[0.55rem] pb-[0.45rem] text-[0.6rem] whitespace-nowrap text-ink-soft transition-colors hover:bg-ink hover:text-paper";

function PlayerHandBase({ cards, selectedIds, lockedId, onToggle, onMove, onSortByRank, onSortBySuit }: PlayerHandProps) {
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
            <span aria-hidden="true" className="grid size-5 animate-spark place-items-center rounded-full bg-coral text-sm leading-none tabular-nums">
              {selectedIds.size}
            </span>
          )}
          <span aria-live="polite" className="sr-only">
            {selectedIds.size > 0 ? t("table.hand.selected", { count: selectedIds.size }) : ""}
          </span>
        </div>
        <div role="group" aria-label={t("table.hand.sortLabel")} className="flex items-center gap-1">
          <span aria-hidden="true" className="label-caps mr-1 hidden text-[0.6rem] text-ink-soft sm:inline">
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
      <p id={HAND_HELP_ID} className="sr-only">
        {t("table.hand.instructions")}
      </p>
      <ul style={fanVars} className="hand-fan flex justify-center pt-8 pb-9 sm:pt-10 lg:pb-6">
        {cards.map((card, index) => (
          <HandCard
            key={cardId(card)}
            card={card}
            index={index}
            isSelected={selectedIds.has(cardId(card))}
            isLocked={lockedId === cardId(card)}
            isDragging={drag.draggingIndex === index}
            fanStyle={styles[index] ?? EMPTY_STYLE}
            onToggle={handleToggle}
            onKeyDown={drag.handleKeyDown}
            onPointerDown={drag.handlePointerDown}
            onPointerMove={drag.handlePointerMove}
            onPointerUp={drag.handlePointerUp}
            onPointerCancel={drag.handlePointerCancel}
          />
        ))}
      </ul>
    </section>
  );
}

export const PlayerHand = memo(PlayerHandBase);
