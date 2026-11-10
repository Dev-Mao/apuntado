"use client";

import { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { Button, BUTTON_VARIANT, ChoicePills } from "@/components";
import { useCardLabel } from "@/hooks/use-card-label";
import { cardId } from "@/lib";

import { useClosureDraft } from "../hooks/use-closure-draft";
import { useClosureSubmit } from "../hooks/use-closure-submit";
import { CLOSURE_SLOT, GROUP_SLOTS, SUBMIT_STATUS } from "../types";
import { ClosureCardButton } from "./closure-card-button";
import { ClosureStatus, ClosureSuccess } from "./closure-status";
import { SlotPanel } from "./slot-panel";

import type { ClosureDialogProps, ClosureSlot } from "../types";

const ALL_SLOTS: readonly ClosureSlot[] = [...GROUP_SLOTS, CLOSURE_SLOT.LEFTOVERS, CLOSURE_SLOT.DISCARD];
const TARGET_BUTTON_CLASSES = "min-h-9 px-4 pt-[0.55rem] pb-[0.45rem] text-[0.62rem]";

type ClosureFormProps = Omit<ClosureDialogProps, "open">;

export function ClosureForm({ cards, allowedClosureTypes, onClose, onSubmit }: ClosureFormProps) {
  const { t } = useTranslation();
  const cardLabel = useCardLabel();
  const draft = useClosureDraft(cards, allowedClosureTypes);
  const { state, submit } = useClosureSubmit(onSubmit);

  const typeOptions = useMemo(
    () => allowedClosureTypes.map((type) => ({ value: type, label: t(`closureType.${type}`) })),
    [allowedClosureTypes, t],
  );
  const slotTitle = (slot: ClosureSlot) => {
    if (slot === CLOSURE_SLOT.LEFTOVERS) return t("closure.leftovers");
    if (slot === CLOSURE_SLOT.DISCARD) return t("closure.discard");
    return t("closure.group", { count: GROUP_SLOTS.indexOf(slot) + 1 });
  };

  if (state.status === SUBMIT_STATUS.ACCEPTED) return <ClosureSuccess />;

  const hasSelection = draft.selectedIds.size > 0;
  const isSubmitting = state.status === SUBMIT_STATUS.SUBMITTING;
  const handleSubmit = () => void submit(draft.draft);

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
                  label={t("closure.selectCard", { card: cardLabel(card) })}
                  isSelected={draft.selectedIds.has(cardId(card))}
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
            disabled={!hasSelection}
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
        <Button variant={BUTTON_VARIANT.OUTLINE} onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? t("closure.submitting") : t("closure.submit")}
        </Button>
      </div>
    </div>
  );
}
