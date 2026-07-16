// ─── Core Types ──────────────────────────────────────────────────────────────

export type Color = 'white' | 'black';

export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

/** The movement style a piece may inherit from the rule mapping */
export type MoveStyle = 'queen' | 'rook' | 'bishop' | 'knight';

export interface Piece {
  type: PieceType;
  color: Color;
}

/** 64-element array; index = rank * 8 + file (a1=0, h1=7, a8=56, h8=63) */
export type Board = (Piece | null)[];

// ─── Rule Mapping ─────────────────────────────────────────────────────────────

/**
 * Defines which movement style each major piece uses.
 * e.g. { queen: 'knight' } means Queens move like Knights.
 * King and Pawn are never included — they always move normally.
 */
export interface RuleMapping {
  queen: MoveStyle;
  rook: MoveStyle;
  bishop: MoveStyle;
  knight: MoveStyle;
}

// ─── Move ────────────────────────────────────────────────────────────────────

export interface Move {
  from: number;
  to: number;
  piece: Piece;
  capturedPiece?: Piece;
  promotion?: PieceType;
  isCastle?: 'kingside' | 'queenside';
  isEnPassant?: boolean;
  notation?: string;
  isCheck?: boolean;
  isCheckmate?: boolean;
}

// ─── Castling Rights ─────────────────────────────────────────────────────────

export interface CastlingRights {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
}

// ─── Game State ───────────────────────────────────────────────────────────────

export type GameStatus =
  | 'playing'
  | 'checkmate'
  | 'stalemate'
  | 'draw'
  | 'resigned'
  | 'timeout'
  | 'aborted'
  | 'abandoned';

export interface GameState {
  board: Board;
  turn: Color;
  ruleMapping: RuleMapping;
  castlingRights: CastlingRights;
  enPassantSquare: number | null;
  moveHistory: Move[];
  capturedPieces: { white: Piece[]; black: Piece[] };
  halfMoveClock: number;
  fullMoveNumber: number;
  status: GameStatus;
  winner?: Color;
  isCheck: boolean;
  legalMoves: Array<{ from: number; to: number; promotion?: PieceType }>;
  timers: { white: number; black: number }; // milliseconds remaining
  lastMoveTimestamp?: number; // server timestamp when last move was made
  positionCounts?: Record<string, number>; // Server-only: 3-fold repetition tracking (not sent to clients)
}

// ─── Player & Room ───────────────────────────────────────────────────────────

export interface PlayerInfo {
  socketId: string;
  nickname: string;
  color: Color;
  isReady: boolean;
  isConnected: boolean;
}

export interface SpectatorInfo {
  socketId: string;
  nickname: string;
  isConnected: boolean;
}

export type RoomPhase = 'waiting' | 'countdown' | 'playing' | 'gameover';

export interface RoomState {
  code: string;
  players: PlayerInfo[];
  spectators: SpectatorInfo[];
  phase: RoomPhase;
  gameState: GameState | null;
  playAgainVotes: string[];
  countdownValue?: number;
  timeControl: number; // in minutes
}

// ─── Socket Event Payloads ───────────────────────────────────────────────────

export interface CreateRoomPayload {
  nickname: string;
  colorPreference?: 'white' | 'black' | 'random';
  timeControl?: number; // in minutes
}

export interface JoinRoomPayload {
  code: string;
  nickname: string;
}

export interface PlayerReadyPayload {
  code: string;
}

export interface MakeMovePayload {
  code: string;
  from: number;
  to: number;
  promotion?: PieceType;
}

export interface ResignPayload {
  code: string;
}

export interface DrawOfferPayload {
  code: string;
}

export interface DrawResponsePayload {
  code: string;
  accept: boolean;
}

export interface PlayAgainPayload {
  code: string;
}

export interface ReconnectPayload {
  code: string;
  nickname: string;
}

// ─── Server → Client Payloads ────────────────────────────────────────────────

export interface RoomCreatedPayload {
  roomCode: string;
  roomState: RoomState;
  playerColor: Color;
}

export interface RoomJoinedPayload {
  roomCode: string;
  roomState: RoomState;
  playerColor: Color | null;
  isSpectator: boolean;
}

export interface RoomUpdatedPayload {
  roomState: RoomState;
}

export interface CountdownPayload {
  value: number;
  ruleMapping: RuleMapping;
}

export interface GameStartedPayload {
  gameState: GameState;
  roomState: RoomState;
}

export interface MoveMadePayload {
  gameState: GameState;
  move: Move;
}

export interface GameOverPayload {
  gameState: GameState;
  reason: 'checkmate' | 'stalemate' | 'draw' | 'resigned' | 'timeout' | 'aborted';
  winner?: Color;
}

export interface DrawOfferedPayload {
  from: string; // nickname
}

export interface ErrorPayload {
  message: string;
}

export interface ReconnectedPayload {
  roomCode: string;
  roomState: RoomState;
  playerColor: Color | null;
  isSpectator: boolean;
}
