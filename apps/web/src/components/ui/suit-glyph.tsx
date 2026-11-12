import { memo } from "react";

import type { Suit } from "@apuntado/contracts";
import type { CSSProperties } from "react";

const HEART = "M50 92C22 68 4 51 4 31 4 16 15 5 29 5c9 0 17 5 21 14 4-9 12-14 21-14 14 0 25 11 25 26 0 20-18 37-46 61z";
const DIAMOND = "M50 2Q68 28 90 50 68 72 50 98 32 72 10 50 32 28 50 2z";
const SPADE =
  "M50 4c12 20 45 35 45 58 0 14-11 23-23 23-9 0-15-4-18-10 1 10 5 17 13 21H33c8-4 12-11 13-21-3 6-9 10-18 10C16 85 5 76 5 62 5 39 38 24 50 4z";
const CLUB_STEM = "M46 58c0 18-5 30-14 38h36c-9-8-14-20-14-38z";

function SuitShape({ suit }: { suit: Suit }) {
  if (suit === "H") return <path d={HEART} />;
  if (suit === "D") return <path d={DIAMOND} />;
  if (suit === "S") return <path d={SPADE} />;
  return (
    <>
      <circle cx="50" cy="27" r="20" />
      <circle cx="26" cy="58" r="20" />
      <circle cx="74" cy="58" r="20" />
      <circle cx="50" cy="52" r="12" />
      <path d={CLUB_STEM} />
    </>
  );
}

interface SuitGlyphProps {
  suit: Suit;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

function SuitGlyphBase({ suit, className, style }: SuitGlyphProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" fill="currentColor" className={className} style={style}>
      <SuitShape suit={suit} />
    </svg>
  );
}

export const SuitGlyph = memo(SuitGlyphBase);
