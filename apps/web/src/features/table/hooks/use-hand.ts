"use client";

import { useCallback, useMemo, useState } from "react";

import { cardId, sortByRank, sortBySuit } from "@/lib";

import type { CardDto } from "@apuntado/contracts";

function arrange(cards: readonly CardDto[], order: readonly string[]): CardDto[] {
  const byId = new Map(cards.map((card) => [cardId(card), card]));
  const known = order.flatMap((id) => byId.get(id) ?? []);
  const fresh = cards.filter((card) => !order.includes(cardId(card)));
  return [...known, ...fresh];
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

export function useHand(cards: readonly CardDto[]) {
  const [order, setOrder] = useState<readonly string[]>(() => cards.map(cardId));
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const [handKey, setHandKey] = useState(() => handKeyOf(cards));

  const nextHandKey = handKeyOf(cards);
  if (nextHandKey !== handKey) {
    setHandKey(nextHandKey);
    setOrder((prev) => arrange(cards, prev).map(cardId));
    setSelected(new Set());
  }

  const ordered = useMemo(() => arrange(cards, order), [cards, order]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const move = useCallback((from: number, to: number) => setOrder((prev) => moveItem(prev, from, to)), []);

  const handleSortByRank = useCallback(() => setOrder(sortByRank(cards).map(cardId)), [cards]);
  const handleSortBySuit = useCallback(() => setOrder(sortBySuit(cards).map(cardId)), [cards]);
  const clearSelection = useCallback(() => setSelected(new Set()), []);

  return { cards: ordered, selectedIds: selected, toggle, move, handleSortByRank, handleSortBySuit, clearSelection };
}
