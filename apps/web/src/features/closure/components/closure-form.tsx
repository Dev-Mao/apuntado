"use client";

import { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { Button, BUTTON_VARIANT, ChoicePills } from "@/components";
import { useCardLabel } from "@/hooks/use-card-label";
import { cardId } from "@/lib";

import { useClosureDraft } from "../hooks";
import { CLOSURE_SLOT, GROUP_SLOTS, SUBMIT_STATUS } from "../types";
import { ClosureCardButton } from "./closure-card-button";
import { ClosureStatus } from "./closure-status";
import { SlotPanel } from "./slot-panel";

import type { ClosureFormProps, ClosureSlot } from "../types";

const ALL_SLOTS: readonly ClosureSlot[] = [...GROUP_SLOTS, CLOSURE_SLOT.LEFTOVERS, CLOSURE_SLOT.DISCARD];
const TARGET_BUTTON_CLASSES = "min-h-9 px-4 pt-[0.55rem] pb-[0.45rem] text-[0.62rem]";

export function ClosureForm({ cards, enabledClosures, cannotDiscard, state, onClose, onSubmit }: ClosureFormProps) {
  const { t } = useTranslation();
  const cardLabel = useCardLabel();
  const lockedId = cannotDiscard ? cardId(cannotDiscard) : null;
  const draft = useClosureDraft(cards, enabledClosures, lockedId);

  const typeOptions = useMemo(
    () => enabledClosures.map((type) => ({ value: type, label: t(`closureType.${type}`) })),
    [enabledClosures, t],
  );
  const slotTitle = (slot: ClosureSlot) => {
    if (slot === CLOSURE_SLOT.LEFTOVERS) return t("closure.leftovers");
    if (slot === CLOSURE_SLOT.DISCARD) return t("closure.discard");
    return t("closure.group", { count: GROUP_SLOTS.indexOf(slot) + 1 });
  };

  const cardLabelFor = (id: string, label: string) =>
    id === lockedId ? t("closure.selectLockedCard", { card: label }) : t("closure.selectCard", { card: label });
  const isSubmitting = state.status === SUBMIT_STATUS.SUBMITTING;
  const handleSubmit = () => {
    if (!isSubmitting) onSubmit(draft.declaration);
  };

  return (
    <div className="mt-3 flex flex-col gap-6">
      <p className="max-w-xl font-display text-ink-soft italic">{t("closure.intro")}</p>
      {typeOptions.length > 1 && (
        <ChoicePills legend={t("closure.type")} name="closure-type" options={typeOptions} value={draft.type} onChange={draft.setType} />
      )}
      <section aria-labelledby="closure-unassigned" className="flex flex-col gap-3">
        <h3 id="closure-unassigned" className="label-caps text-[0.7rem] text-ink-soft">
          {t("closure.unassigned")}
        </h3>
        {draft.unassigned.length === 0 ? (
          <p className="font-display italic">{t("closure.allAssigned")}</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5 pt-2">
            {draft.unassigned.map((card) => (
              <li key={cardId(card)}>
                <ClosureCardButton
                  card={card}
                  label={cardLabelFor(cardId(card), cardLabel(card))}
                  isSelected={draft.selectedIds.has(cardId(card))}
                  isLocked={cardId(card) === lockedId}
                  onPress={draft.toggle}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
      <div role="group" aria-labelledby="closure-move-to" className="flex flex-wrap items-center gap-2">
        <span id="closure-move-to" className="label-caps mr-1 text-[0.65rem] text-ink-soft">
          {t("closure.moveTo")}
        </span>
        {ALL_SLOTS.map((slot) => (
          <Button
            key={slot}
            variant={BUTTON_VARIANT.OUTLINE}
            disabled={slot === CLOSURE_SLOT.DISCARD ? !draft.canDiscardSelection : !draft.hasSelection}
            onClick={() => draft.assign(slot)}
            className={TARGET_BUTTON_CLASSES}
          >
            {slotTitle(slot)}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ALL_SLOTS.map((slot) => (
          <SlotPanel key={slot} slot={slot} title={slotTitle(slot)} cards={draft.cardsIn(slot)} onReturn={draft.unassign} />
        ))}
      </div>
      <ClosureStatus state={state} />
      <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
        <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onClose} disabled={isSubmitting}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          aria-disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="aria-disabled:cursor-wait aria-disabled:opacity-70"
        >
          {isSubmitting ? t("closure.submitting") : t("closure.submit")}
        </Button>
      </div>
    </div>
  );
}
