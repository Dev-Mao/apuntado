"use client";

import { memo } from "react";

import { useTranslation } from "react-i18next";

import { CloseIcon } from "@/components";
import { cn } from "@/lib";

import { GROUP_COLORS } from "./hand-card";

interface HandGroupsBarProps {
  groups: readonly (readonly string[])[];
  canGroup: boolean;
  selectedCount: number;
  onGroup: () => void;
  onUngroup: (index: number) => void;
}

function HandGroupsBarBase({ groups, canGroup, selectedCount, onGroup, onUngroup }: HandGroupsBarProps) {
  const { t } = useTranslation();
  if (groups.length === 0 && !canGroup) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canGroup && (
        <button
          type="button"
          onClick={onGroup}
          className="label-caps inline-flex min-h-9 items-center rounded-full border-2 border-ink bg-coral px-3.5 text-[0.65rem] shadow-[2px_2px_0_var(--color-ink)] transition-[translate,box-shadow] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          {t("table.hand.group", { count: selectedCount })}
        </button>
      )}
      {groups.map((group, index) => (
        <span key={group.join(",")} className="inline-flex items-center gap-1.5 rounded-full bg-paper-deep/70 py-1 pr-1 pl-2.5 text-sm font-semibold">
          <span aria-hidden="true" className={cn("size-2.5 rounded-full", GROUP_COLORS[index % GROUP_COLORS.length])} />
          {t("table.hand.groupTag", { group: index + 1, count: group.length })}
          <button
            type="button"
            onClick={() => onUngroup(index)}
            aria-label={t("table.hand.ungroup", { group: index + 1 })}
            className="grid size-7 place-items-center rounded-full transition-colors hover:bg-ink hover:text-paper"
          >
            <CloseIcon className="size-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
}

export const HandGroupsBar = memo(HandGroupsBarBase);
