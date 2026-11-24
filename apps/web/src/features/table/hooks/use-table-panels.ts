"use client";

import { useCallback, useState } from "react";

type TablePanel = "rules" | "scores" | "abandon";

export function useTablePanels() {
  const [panel, setPanel] = useState<TablePanel | null>(null);
  const showRules = useCallback(() => setPanel("rules"), []);
  const showScores = useCallback(() => setPanel("scores"), []);
  const showAbandon = useCallback(() => setPanel("abandon"), []);
  const close = useCallback(() => setPanel(null), []);
  return { rulesOpen: panel === "rules", scoresOpen: panel === "scores", abandonOpen: panel === "abandon", showRules, showScores, showAbandon, close };
}
