"use client";

import { useCallback, useMemo, useState } from "react";

import { cardId } from "@/lib";

import { CLOSURE_SLOT, GROUP_SLOTS } from "../types";

import type { ClosureDraft, ClosureSlot } from "../types";
import type { CardDto, ClosureType } from "@apuntado/contracts";

type Assignments = Readonly<Record<string, ClosureSlot>>;

function assignCards(prev: Assignments, ids: readonly string[], slot: ClosureSlot): Assignments {
  if (slot !== CLOSURE_SLOT.DISCARD) return { ...prev, ...Object.fromEntries(ids.map((id) => [id, slot])) };
  const withoutDiscard = Object.fromEntries(Object.entries(prev).filter(([, value]) => value !== CLOSURE_SLOT.DISCARD));
  const [first] = ids;
  return first ? { ...withoutDiscard, [first]: slot } : withoutDiscard;
}

export function useClosureDraft(cards: readonly CardDto[], allowedTypes: readonly ClosureType[]) {
  const [assignments, setAssignments] = useState<Assignments>({});
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [type, setType] = useState<ClosureType>(allowedTypes[0] ?? "CLASICO");

  const unassigned = useMemo(() => cards.filter((card) => !assignments[cardId(card)]), [cards, assignments]);

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
      const ids = unassigned.map(cardId).filter((id) => selectedIds.has(id));
      setAssignments((prev) => assignCards(prev, ids, slot));
      setSelectedIds(new Set());
    },
    [unassigned, selectedIds],
  );

  const unassign = useCallback((id: string) => {
    setAssignments((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id)));
  }, []);

  const draft = useMemo<ClosureDraft>(
    () => ({
      type,
      groups: GROUP_SLOTS.map(cardsIn).filter((group) => group.length > 0),
      leftovers: cardsIn(CLOSURE_SLOT.LEFTOVERS),
      discard: cardsIn(CLOSURE_SLOT.DISCARD)[0] ?? null,
    }),
    [type, cardsIn],
  );

  return { type, setType, unassigned, selectedIds, cardsIn, toggle, assign, unassign, draft };
}
