"use client";

import { useCallback, useState } from "react";

type TablePanel = "rules" | "scores";

export function useTablePanels() {
  const [panel, setPanel] = useState<TablePanel | null>(null);
  const showRules = useCallback(() => setPanel("rules"), []);
  const showScores = useCallback(() => setPanel("scores"), []);
  const close = useCallback(() => setPanel(null), []);
  return { rulesOpen: panel === "rules", scoresOpen: panel === "scores", showRules, showScores, close };
}
