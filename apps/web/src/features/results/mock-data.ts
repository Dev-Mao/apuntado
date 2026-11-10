import type { ResultsView } from "./types";

export const MOCK_ROUND_RESULTS: ResultsView = {
  round: 3,
  mode: "AMBAS",
  eliminationThreshold: 101,
  winnerId: null,
  players: [
    { id: "p3", name: "Valentina", roundPoints: 0, totalPoints: 18, isEliminated: false, closedRound: true },
    { id: "p1", name: "Mariana", roundPoints: 4, totalPoints: 38, isEliminated: false, closedRound: false },
    { id: "p2", name: "Andrés", roundPoints: 18, totalPoints: 90, isEliminated: false, closedRound: false },
    { id: "p4", name: "Tomás", roundPoints: 11, totalPoints: 106, isEliminated: true, closedRound: false },
  ],
};

export const MOCK_GAME_RESULTS: ResultsView = {
  round: 6,
  mode: "AMBAS",
  eliminationThreshold: 101,
  winnerId: "p3",
  players: [
    { id: "p3", name: "Valentina", roundPoints: 0, totalPoints: 41, isEliminated: false, closedRound: true },
    { id: "p1", name: "Mariana", roundPoints: 31, totalPoints: 104, isEliminated: true, closedRound: false },
    { id: "p4", name: "Tomás", roundPoints: 0, totalPoints: 106, isEliminated: true, closedRound: false },
    { id: "p2", name: "Andrés", roundPoints: 0, totalPoints: 112, isEliminated: true, closedRound: false },
  ],
};
