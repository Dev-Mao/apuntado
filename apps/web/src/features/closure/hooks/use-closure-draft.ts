"use client";

import { useCallback, useMemo, useState } from "react";

import { cardId } from "@/lib";

import { CLOSURE_SLOT, GROUP_SLOTS } from "../types";

import type { ClosureSlot } from "../types";
import type { CardDto, ClosureDeclarationDto, ClosureType } from "@apuntado/contracts";

type Assignments = Readonly<Record<string, ClosureSlot>>;

function assignCards(prev: Assignments, ids: readonly string[], slot: ClosureSlot): Assignments {
  if (slot !== CLOSURE_SLOT.DISCARD) return { ...prev, ...Object.fromEntries(ids.map((id) => [id, slot])) };
  const withoutDiscard = Object.fromEntries(Object.entries(prev).filter(([, value]) => value !== CLOSURE_SLOT.DISCARD));
  const [first] = ids;
  return first ? { ...withoutDiscard, [first]: slot } : withoutDiscard;
}

export function useClosureDraft(cards: readonly CardDto[], enabledClosures: readonly ClosureType[], lockedId: string | null) {
  const [assignments, setAssignments] = useState<Assignments>({});
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [type, setType] = useState<ClosureType>(enabledClosures[0] ?? "CLASICO");

  const unassigned = useMemo(() => cards.filter((card) => !assignments[cardId(card)]), [cards, assignments]);
  const selectedUnassigned = useMemo(
    () => unassigned.map(cardId).filter((id) => selectedIds.has(id)),
    [unassigned, selectedIds],
  );
  const discardable = useMemo(() => selectedUnassigned.filter((id) => id !== lockedId), [selectedUnassigned, lockedId]);

  const cardsIn = useCallback(
    (slot: ClosureSlot) => cards.filter((card) => assignments[cardId(card)] === slot),
    [cards, assignments],
  );

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const assign = useCallback(
    (slot: ClosureSlot) => {
      const ids = slot === CLOSURE_SLOT.DISCARD ? discardable : selectedUnassigned;
      setAssignments((prev) => assignCards(prev, ids, slot));
      setSelectedIds(new Set());
    },
    [discardable, selectedUnassigned],
  );

  const unassign = useCallback((id: string) => {
    setAssignments((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id)));
  }, []);

  const declaration = useMemo<ClosureDeclarationDto>(
    () => ({
      type,
      melds: GROUP_SLOTS.map(cardsIn).filter((meld) => meld.length > 0),
      leftovers: cardsIn(CLOSURE_SLOT.LEFTOVERS),
      discard: cardsIn(CLOSURE_SLOT.DISCARD)[0] ?? null,
    }),
    [type, cardsIn],
  );

  return {
    type,
    setType,
    unassigned,
    selectedIds,
    hasSelection: selectedUnassigned.length > 0,
    canDiscardSelection: discardable.length > 0,
    cardsIn,
    toggle,
    assign,
    unassign,
    declaration,
  };
}
