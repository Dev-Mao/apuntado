import type { CardDto, PlayerAction, TableSnapshot } from "@apuntado/contracts";

export const MOCK_DRAW_ACTIONS: readonly PlayerAction[] = ["DRAW_STOCK", "DRAW_DISCARD"];
export const MOCK_DISCARD_ACTIONS: readonly PlayerAction[] = ["DISCARD", "DECLARE_CLOSURE"];

export const MOCK_TABLE_SNAPSHOT: TableSnapshot = {
  code: "K7Q2",
  seats: [
    { playerId: "p1", nickname: "Mariana", connected: true, isBot: false },
    { playerId: "p2", nickname: "Andrés", connected: true, isBot: false },
    { playerId: "p3", nickname: "Valentina", connected: true, isBot: false },
    { playerId: "p4", nickname: "Tomás", connected: false, isBot: false },
  ],
  view: {
    gameId: "g-k7q2",
    mode: "AMBAS",
    eliminationThreshold: 101,
    enabledClosures: ["CLASICO", "APUNTADO"],
    status: "PLAYING",
    roundNumber: 3,
    playerId: "p1",
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
    cannotDiscard: null,
    allowedActions: MOCK_DRAW_ACTIONS,
    opponents: [
      { playerId: "p2", cardCount: 10 },
      { playerId: "p3", cardCount: 10 },
      { playerId: "p4", cardCount: 10 },
    ],
    stockSize: 18,
    discardTop: { rank: "5", suit: "D" },
    currentPlayerId: "p1",
    phase: "DRAW",
    turnDeadline: null,
    serverTime: "2026-11-10T15:00:00.000Z",
    scoreboard: [
      { playerId: "p1", total: 34, eliminated: false },
      { playerId: "p2", total: 72, eliminated: false },
      { playerId: "p3", total: 18, eliminated: false },
      { playerId: "p4", total: 95, eliminated: false },
    ],
    lastRound: null,
    winnerId: null,
  },
};

export const MOCK_STOCK_DRAWS: readonly CardDto[] = [
  { rank: "8", suit: "H" },
  { rank: "3", suit: "C" },
  { rank: "K", suit: "D" },
  { rank: "4", suit: "S" },
];

export const MOCK_UNDER_DISCARD: CardDto = { rank: "J", suit: "D" };
