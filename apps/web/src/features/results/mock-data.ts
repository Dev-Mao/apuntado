import type { PlayerView, SeatView, TableSnapshot } from "@apuntado/contracts";

const MOCK_SEATS: readonly SeatView[] = [
  { playerId: "p1", nickname: "Mariana", connected: true, isBot: false },
  { playerId: "p2", nickname: "Andrés", connected: true, isBot: false },
  { playerId: "p3", nickname: "Valentina", connected: true, isBot: false },
  { playerId: "p4", nickname: "Tomás", connected: false, isBot: false },
];

const BETWEEN_ROUNDS: Omit<PlayerView, "status" | "roundNumber" | "scoreboard" | "lastRound" | "winnerId"> = {
  gameId: "g-k7q2",
  mode: "AMBAS",
  eliminationThreshold: 101,
  enabledClosures: ["CLASICO", "APUNTADO"],
  playerId: "p1",
  hand: [],
  cannotDiscard: null,
  allowedActions: [],
  opponents: [
    { playerId: "p2", cardCount: 0 },
    { playerId: "p3", cardCount: 0 },
    { playerId: "p4", cardCount: 0 },
  ],
  stockSize: 0,
  discardTop: null,
  currentPlayerId: null,
  phase: null,
  turnDeadline: null,
  serverTime: "2026-11-10T15:20:00.000Z",
};

export const MOCK_ROUND_SNAPSHOT: TableSnapshot = {
  code: "K7Q2",
  seats: MOCK_SEATS,
  view: {
    ...BETWEEN_ROUNDS,
    status: "ROUND_OVER",
    roundNumber: 3,
    scoreboard: [
      { playerId: "p3", total: 18, eliminated: false },
      { playerId: "p1", total: 38, eliminated: false },
      { playerId: "p2", total: 90, eliminated: false },
      { playerId: "p4", total: 106, eliminated: true },
    ],
    lastRound: {
      roundNumber: 3,
      roundWinnerId: "p3",
      closureType: "APUNTADO",
      scores: [
        { playerId: "p3", points: 0 },
        { playerId: "p1", points: 4 },
        { playerId: "p2", points: 18 },
        { playerId: "p4", points: 11 },
      ],
    },
    winnerId: null,
  },
};

export const MOCK_MATCH_SNAPSHOT: TableSnapshot = {
  code: "K7Q2",
  seats: MOCK_SEATS,
  view: {
    ...BETWEEN_ROUNDS,
    status: "FINISHED",
    roundNumber: 6,
    scoreboard: [
      { playerId: "p3", total: 41, eliminated: false },
      { playerId: "p1", total: 104, eliminated: true },
      { playerId: "p4", total: 106, eliminated: true },
      { playerId: "p2", total: 112, eliminated: true },
    ],
    lastRound: {
      roundNumber: 6,
      roundWinnerId: "p3",
      closureType: "CLASICO",
      scores: [
        { playerId: "p3", points: 0 },
        { playerId: "p1", points: 31 },
        { playerId: "p4", points: 0 },
        { playerId: "p2", points: 0 },
      ],
    },
    winnerId: "p3",
  },
};
