import { PLAYER_ACTION, TURN_PHASE } from "./types";

import type { TableView } from "./types";
import type { CardDto } from "@apuntado/contracts";

export const MOCK_TABLE_VIEW: TableView = {
  code: "K7Q2",
  round: 3,
  mode: "AMBAS",
  eliminationThreshold: 101,
  selfId: "p1",
  selfName: "Mariana",
  hand: [
    { rank: "7", suit: "H" },
    { rank: "K", suit: "S" },
    { rank: "2", suit: "D" },
    { rank: "7", suit: "C" },
    { rank: "9", suit: "H" },
    { rank: "Q", suit: "H" },
    { rank: "A", suit: "S" },
    { rank: "7", suit: "S" },
    { rank: "10", suit: "D" },
    { rank: "J", suit: "C" },
  ],
  opponents: [
    { id: "p2", name: "Andrés", cardCount: 10, isConnected: true },
    { id: "p3", name: "Valentina", cardCount: 10, isConnected: true },
    { id: "p4", name: "Tomás", cardCount: 10, isConnected: false },
  ],
  stockCount: 18,
  discardTop: { rank: "5", suit: "D" },
  scoreboard: [
    { playerId: "p1", name: "Mariana", points: 34, isEliminated: false },
    { playerId: "p2", name: "Andrés", points: 72, isEliminated: false },
    { playerId: "p3", name: "Valentina", points: 18, isEliminated: false },
    { playerId: "p4", name: "Tomás", points: 95, isEliminated: false },
  ],
  turn: { playerId: "p1", phase: TURN_PHASE.DRAW, secondsLeft: 42 },
  allowedActions: [PLAYER_ACTION.DRAW_STOCK, PLAYER_ACTION.TAKE_DISCARD],
  allowedClosureTypes: ["CLASICO", "APUNTADO"],
};

export const MOCK_STOCK_DRAWS: readonly CardDto[] = [
  { rank: "8", suit: "H" },
  { rank: "3", suit: "C" },
  { rank: "K", suit: "D" },
  { rank: "4", suit: "S" },
];

export const MOCK_UNDER_DISCARD: CardDto = { rank: "J", suit: "D" };
