"use client";

import { useTranslation } from "react-i18next";

import { Button, BUTTON_VARIANT } from "@/components";
import { useCardLabel } from "@/hooks/use-card-label";
import { cardId } from "@/lib";

import { ClosureCardButton } from "./closure-card-button";

import type { CardDto } from "@apuntado/contracts";

interface ClosureTrayProps {
  cards: readonly CardDto[];
  selectedIds: ReadonlySet<string>;
  lockedId: string | null;
  isSubmitting: boolean;
  onToggle: (id: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function ClosureTray({ cards, selectedIds, lockedId, isSubmitting, onToggle, onCancel, onSubmit }: ClosureTrayProps) {
  const { t } = useTranslation();
  const cardLabel = useCardLabel();
  const labelFor = (card: CardDto) =>
    cardId(card) === lockedId
      ? t("closure.selectLockedCard", { card: cardLabel(card) })
      : t("closure.selectCard", { card: cardLabel(card) });

  return (
    <div className="sticky bottom-0 -mx-5 -mb-6 flex flex-col gap-3 border-t border-line bg-paper-light/95 px-5 pt-3 pb-4 backdrop-blur-sm sm:-mx-9 sm:px-9">
      <section aria-labelledby="closure-unassigned" className="flex flex-col gap-2">
        <h3 id="closure-unassigned" className="label-caps text-[0.65rem] text-ink-soft">
          {t("closure.unassigned")}
        </h3>
        {cards.length === 0 ? (
          <p className="text-ink italic">{t("closure.allAssigned")}</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5 pt-2.5">
            {cards.map((card) => (
              <li key={cardId(card)}>
                <ClosureCardButton
                  card={card}
                  label={labelFor(card)}
                  isSelected={selectedIds.has(cardId(card))}
                  isLocked={cardId(card) === lockedId}
                  onPress={onToggle}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="flex gap-2 sm:justify-end">
        <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onCancel} disabled={isSubmitting} className="flex-1 sm:flex-none">
          {t("common.cancel")}
        </Button>
        <Button
          onClick={onSubmit}
          aria-disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="flex-1 aria-disabled:cursor-wait aria-disabled:opacity-70 sm:flex-none"
        >
          {isSubmitting ? t("closure.submitting") : t("closure.submit")}
        </Button>
      </div>
    </div>
  );
}
