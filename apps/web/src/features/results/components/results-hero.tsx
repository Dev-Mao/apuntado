"use client";

import { useTranslation } from "react-i18next";

import { CardFan } from "@/components";

import type { ResultsSummary } from "../types";
import type { CardDto } from "@apuntado/contracts";

const WINNING_HAND: readonly CardDto[] = [
  { rank: "10", suit: "H" },
  { rank: "J", suit: "H" },
  { rank: "Q", suit: "H" },
  { rank: "K", suit: "H" },
  { rank: "A", suit: "S" },
];

interface ResultsHeroProps {
  summary: ResultsSummary;
  isSelfWinner: boolean;
}

function useHeadline({ summary, isSelfWinner }: ResultsHeroProps) {
  const { t } = useTranslation();
  if (isSelfWinner) return t("results.selfWon");
  if (summary.winnerName) return t("results.gameTitle", { name: summary.winnerName });
  return t("results.roundTitle", { count: summary.roundNumber });
}

export function ResultsHero(props: ResultsHeroProps) {
  const { t } = useTranslation();
  const { summary } = props;
  const headline = useHeadline(props);
  const closure =
    summary.closureType && summary.roundWinnerName
      ? t("results.closedBy", { name: summary.roundWinnerName, closure: t(`results.closure.${summary.closureType}`) })
      : t("results.noClosure");

  return (
    <div className="flex shrink-0 flex-col items-center gap-3 text-center">
      {summary.isFinished && <CardFan cards={WINNING_HAND} spreadDeg={7} delayMs={150} className="mb-6 max-sm:-my-6 max-sm:scale-[0.7] [@media(max-height:50rem)]:hidden" />}
      <h1
        className={
          summary.isFinished
            ? "animate-turn-in font-display text-[clamp(2.6rem,7vw,4.6rem)] leading-[0.95] font-semibold tracking-[-0.02em] text-balance [animation-delay:650ms] tiny:text-[2rem]"
            : "font-display text-[clamp(2.4rem,6vw,4rem)] leading-[0.95] font-semibold tracking-[-0.02em] text-balance tiny:text-[2rem]"
        }
      >
        {headline}
      </h1>
      <p className="max-w-md text-xl italic">
        <span className="text-coral-ink">{t(`gameMode.${summary.mode}`)}</span>
        {". "}
        {closure}
      </p>
    </div>
  );
}
