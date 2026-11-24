"use client";

import { useCallback, useMemo, useState } from "react";

import { cardId, sortByRank, sortBySuit } from "@/lib";

import type { CardDto } from "@apuntado/contracts";

export type HandGroups = readonly (readonly string[])[];

export const MAX_GROUPS = 3;
const MIN_GROUP_SIZE = 3;
const MAX_GROUP_SIZE = 4;

function arrange(cards: readonly CardDto[], order: readonly string[]): CardDto[] {
  const byId = new Map(cards.map((card) => [cardId(card), card]));
  const known = order.flatMap((id) => byId.get(id) ?? []);
  const fresh = cards.filter((card) => !order.includes(cardId(card)));
  return [...known, ...fresh];
}

function groupsFirst(cards: readonly CardDto[], groups: HandGroups): CardDto[] {
  const position = new Map(cards.map((card, index) => [cardId(card), index]));
  const grouped = new Set(groups.flat());
  const byPosition = (ids: readonly string[]) => [...ids].sort((a, b) => (position.get(a) ?? 0) - (position.get(b) ?? 0));
  const byId = new Map(cards.map((card) => [cardId(card), card]));
  const head = groups.flatMap((group) => byPosition(group).flatMap((id) => byId.get(id) ?? []));
  return [...head, ...cards.filter((card) => !grouped.has(cardId(card)))];
}

function keepPresent(groups: HandGroups, cards: readonly CardDto[]): HandGroups {
  const present = new Set(cards.map(cardId));
  return groups.map((group) => group.filter((id) => present.has(id))).filter((group) => group.length > 0);
}

function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  if (moved !== undefined) next.splice(to, 0, moved);
  return next;
}

function handKeyOf(cards: readonly CardDto[]): string {
  return cards.map(cardId).sort().join(",");
}

function canFormGroup(selected: ReadonlySet<string>, groups: HandGroups): boolean {
  const regrouping = groups.filter((group) => group.some((id) => selected.has(id))).length;
  const sizeFits = selected.size >= MIN_GROUP_SIZE && selected.size <= MAX_GROUP_SIZE;
  return sizeFits && groups.length - regrouping < MAX_GROUPS;
}

export function useHand(cards: readonly CardDto[]) {
  const [order, setOrder] = useState<readonly string[]>(() => cards.map(cardId));
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const [groups, setGroups] = useState<HandGroups>([]);
  const [handKey, setHandKey] = useState(() => handKeyOf(cards));

  const nextHandKey = handKeyOf(cards);
  if (nextHandKey !== handKey) {
    setHandKey(nextHandKey);
    setOrder((prev) => arrange(cards, prev).map(cardId));
    setGroups((prev) => keepPresent(prev, cards));
    setSelected(new Set());
  }

  const ordered = useMemo(() => groupsFirst(arrange(cards, order), groups), [cards, order, groups]);
  const groupOf = useMemo(() => new Map(groups.flatMap((group, index) => group.map((id) => [id, index] as const))), [groups]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const move = useCallback((from: number, to: number) => setOrder(moveItem(ordered.map(cardId), from, to)), [ordered]);

  const group = useCallback(() => {
    if (!canFormGroup(selected, groups)) return;
    const ids = ordered.map(cardId).filter((id) => selected.has(id));
    setGroups((prev) => [...prev.map((existing) => existing.filter((id) => !selected.has(id))).filter((existing) => existing.length > 0), ids]);
    setSelected(new Set());
  }, [selected, groups, ordered]);

  const ungroup = useCallback((index: number) => setGroups((prev) => prev.filter((_, position) => position !== index)), []);

  const handleSortByRank = useCallback(() => setOrder(sortByRank(cards).map(cardId)), [cards]);
  const handleSortBySuit = useCallback(() => setOrder(sortBySuit(cards).map(cardId)), [cards]);
  const clearSelection = useCallback(() => setSelected(new Set()), []);

  return {
    cards: ordered,
    selectedIds: selected,
    groups,
    groupOf,
    canGroup: canFormGroup(selected, groups),
    toggle,
    move,
    group,
    ungroup,
    handleSortByRank,
    handleSortBySuit,
    clearSelection,
  };
}
