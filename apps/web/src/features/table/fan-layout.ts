import type { CSSProperties } from "react";

export function fanStyles(count: number, spreadDeg: number, arcPx: number): CSSProperties[] {
  const middle = (count - 1) / 2;
  return Array.from({ length: count }, (_, index) => {
    const offset = index - middle;
    return {
      rotate: `${offset * spreadDeg}deg`,
      translate: `0 ${Math.round(offset * offset * arcPx)}px`,
    };
  });
}
