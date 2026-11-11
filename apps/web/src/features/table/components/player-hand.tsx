"use client";

import { memo, useCallback, useMemo } from "react";

import { useTranslation } from "react-i18next";

import { Button, BUTTON_VARIANT } from "@/components";
import { cardId } from "@/lib";

import { fanStyles } from "../fan-layout";
import { useHandDrag } from "../hooks";
import { HAND_HELP_ID, HandCard } from "./hand-card";

import type { PlayerHandProps } from "../types";

const HAND_SPREAD_DEG = 2.4;
const HAND_ARC_PX = 0.7;
const EMPTY_STYLE = {};
const SORT_BUTTON_CLASSES = "min-h-9 px-4 pt-[0.55rem] pb-[0.45rem] text-[0.62rem]";

function PlayerHandBase({ cards, selectedIds, onToggle, onMove, onSortByRank, onSortBySuit }: PlayerHandProps) {
  const { t } = useTranslation();
  const drag = useHandDrag(onMove, cards.length);
  const styles = useMemo(() => fanStyles(cards.length, HAND_SPREAD_DEG, HAND_ARC_PX), [cards.length]);
  const { consumeSuppressedClick } = drag;

  const handleToggle = useCallback(
    (id: string) => {
      if (!consumeSuppressedClick()) onToggle(id);
    },
    [consumeSuppressedClick, onToggle],
  );

  return (
    <section aria-labelledby="hand-title" className="flex flex-col gap-3 px-4 pt-2 pb-5 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 id="hand-title" className="label-caps text-xs">
            {t("table.hand.label")}
          </h2>
          <span aria-live="polite" className="font-display text-sm text-ink-soft italic">
            {selectedIds.size > 0 ? t("table.hand.selected", { count: selectedIds.size }) : ""}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onSortByRank} className={SORT_BUTTON_CLASSES}>
            {t("table.hand.sortByRank")}
          </Button>
          <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onSortBySuit} className={SORT_BUTTON_CLASSES}>
            {t("table.hand.sortBySuit")}
          </Button>
        </div>
      </div>
      <p id={HAND_HELP_ID} className="sr-only">
        {t("table.hand.instructions")}
      </p>
      <ul className="flex justify-center pt-5 pb-5">
        {cards.map((card, index) => (
          <HandCard
            key={cardId(card)}
            card={card}
            index={index}
            isSelected={selectedIds.has(cardId(card))}
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
