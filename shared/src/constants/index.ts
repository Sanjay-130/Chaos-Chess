// ─── Timer Defaults ───────────────────────────────────────────────────────────
/** Default time per player in milliseconds (10 minutes) */
export const DEFAULT_TIMER_MS = 10 * 60 * 1000;

/** Timer tick interval in milliseconds */
export const TIMER_TICK_MS = 1000;

// ─── Room ─────────────────────────────────────────────────────────────────────
/** Max players per room */
export const MAX_PLAYERS = 2;

/** Seconds to show rule screen before game starts */
export const RULE_COUNTDOWN_SECONDS = 15;

/** Minutes to keep a room alive after all players disconnect */
export const ROOM_TTL_MINUTES = 5;

// ─── Board ────────────────────────────────────────────────────────────────────
export const BOARD_SIZE = 64;

/** Initial board positions as FEN piece map (for react-chessboard) */
export const PIECE_FEN_MAP: Record<string, string> = {
  wP: '♙', wN: '♘', wB: '♗', wR: '♖', wQ: '♕', wK: '♔',
  bP: '♟', bN: '♞', bB: '♝', bR: '♜', bQ: '♛', bK: '♚',
};

// ─── Socket Events ───────────────────────────────────────────────────────────
export const SOCKET_EVENTS = {
  // Client → Server
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  PLAYER_READY: 'player-ready',
  MAKE_MOVE: 'make-move',
  RESIGN: 'resign',
  DRAW_OFFER: 'draw-offer',
  DRAW_RESPONSE: 'draw-response',
  PLAY_AGAIN: 'play-again',
  RECONNECT: 'reconnect',

  // Server → Client
  ROOM_CREATED: 'room-created',
  ROOM_JOINED: 'room-joined',
  ROOM_UPDATED: 'room-updated',
  COUNTDOWN: 'countdown',
  GAME_STARTED: 'game-started',
  MOVE_MADE: 'move-made',
  GAME_OVER: 'game-over',
  DRAW_OFFERED: 'draw-offered',
  DRAW_DECLINED: 'draw-declined',
  RECONNECTED: 'reconnected',
  ERROR: 'error',
  PLAYER_DISCONNECTED: 'player-disconnected',
  PLAYER_RECONNECTED: 'player-reconnected',
  SPECTATOR_JOINED: 'spectator-joined',
  SPECTATOR_LEFT: 'spectator-left',
} as const;
