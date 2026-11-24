"use client";

import { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { ChoicePills } from "@/components";
import { useCardLabel } from "@/hooks/use-card-label";
import { cardId, cn } from "@/lib";

import { useClosureDraft } from "../hooks";
import { CLOSURE_SLOT, GROUP_SLOTS, SUBMIT_STATUS } from "../types";
import { ClosureStatus } from "./closure-status";
import { ClosureTray } from "./closure-tray";
import { SlotPanel } from "./slot-panel";

import type { ClosureFormProps, ClosureSlot } from "../types";

const ALL_SLOTS: readonly ClosureSlot[] = [...GROUP_SLOTS, CLOSURE_SLOT.LEFTOVERS, CLOSURE_SLOT.DISCARD];

export function ClosureForm({ cards, groups, enabledClosures, cannotDiscard, state, onClose, onEdit, onSubmit }: ClosureFormProps) {
  const { t } = useTranslation();
  const cardLabel = useCardLabel();
  const lockedId = cannotDiscard ? cardId(cannotDiscard) : null;
  const draft = useClosureDraft(cards, enabledClosures, lockedId, groups);

  const typeOptions = useMemo(
    () => enabledClosures.map((type) => ({ value: type, label: t(`closureType.${type}`) })),
    [enabledClosures, t],
  );
  const slotTitle = (slot: ClosureSlot) => {
    if (slot === CLOSURE_SLOT.LEFTOVERS) return t("closure.leftovers");
    if (slot === CLOSURE_SLOT.DISCARD) return t("closure.discard");
    return t("closure.group", { count: GROUP_SLOTS.indexOf(slot) + 1 });
  };
  const canAssign = (slot: ClosureSlot) => (slot === CLOSURE_SLOT.DISCARD ? draft.canDiscardSelection : draft.hasSelection);
  const isSubmitting = state.status === SUBMIT_STATUS.SUBMITTING;
  const slots = draft.type === "CLASICO" ? ALL_SLOTS.filter((slot) => slot !== CLOSURE_SLOT.LEFTOVERS) : ALL_SLOTS;
  const edited =
    <A extends unknown[]>(action: (...args: A) => void) =>
    (...args: A) => {
      action(...args);
      onEdit();
    };
  const handleSubmit = () => {
    if (!isSubmitting) onSubmit(draft.declaration);
  };

  return (
    <div className="mt-4 flex flex-col gap-5 short:mt-3 short:gap-3">
      <p className="max-w-xl text-lg leading-snug text-ink-soft italic short:hidden">{t("closure.intro")}</p>
      {cannotDiscard && (
        <p className="flex items-center gap-2 text-sm font-semibold text-coral-ink">
          <span className="label-caps rounded-full border-2 border-ink bg-coral px-2 py-0.5 text-[0.6rem] text-ink">{t("table.hand.lockedTag")}</span>
          {t("closure.lockedHint", { card: cardLabel(cannotDiscard) })}
        </p>
      )}
      <div className="flex flex-col gap-2">
        {typeOptions.length > 1 && (
          <ChoicePills legend={t("closure.type")} name="closure-type" options={typeOptions} value={draft.type} onChange={edited(draft.setType)} />
        )}
        <p className="text-sm font-semibold">{t(`closure.typeRule.${draft.type}`)}</p>
      </div>
      <div className={cn("grid grid-cols-2 gap-2.5 sm:grid-cols-3", slots.length === ALL_SLOTS.length ? "lg:grid-cols-5" : "lg:grid-cols-4")}>
        {slots.map((slot) => (
          <SlotPanel
            key={slot}
            slot={slot}
            title={slotTitle(slot)}
            cards={draft.cardsIn(slot)}
            canAssign={canAssign(slot)}
            lockedId={lockedId}
            onAssign={edited(draft.assign)}
            onReturn={edited(draft.unassign)}
          />
        ))}
      </div>
      <ClosureStatus state={state} />
      <ClosureTray
        cards={draft.unassigned}
        selectedIds={draft.selectedIds}
        lockedId={lockedId}
        isSubmitting={isSubmitting}
        onToggle={draft.toggle}
        onCancel={onClose}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
