import {
  Board, Color, Move, PieceType, RuleMapping,
  CastlingRights, GameState, GameStatus, Piece,
} from '@chaos-chess/shared';
import { DEFAULT_TIMER_MS } from '@chaos-chess/shared';
import { createInitialBoard, initialCastlingRights, indexToSquare } from './board';
import { applyMoveToBoard } from './moveApplicator';
import { generateLegalMoves, isInCheck, detectGameEnd } from './moveValidator';
import { generateRuleMapping } from './ruleGenerator';
import { generateNotation } from '../utils/notation';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBoardKey(board: Board, turn: Color, castlingRights: CastlingRights, enPassantSquare: number | null): string {
  let fen = '';
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    fen += p ? (p.color === 'white' ? p.type[0].toUpperCase() : p.type[0]) : '.';
  }
  fen += `_${turn}_${castlingRights.whiteKingside ? 'K' : ''}${castlingRights.whiteQueenside ? 'Q' : ''}${castlingRights.blackKingside ? 'k' : ''}${castlingRights.blackQueenside ? 'q' : ''}_${enPassantSquare ?? '-'}`;
  return fen;
}

// ─── Game Manager ─────────────────────────────────────────────────────────────

export function createInitialGameState(ruleMapping: RuleMapping, initialTimerMs: number = DEFAULT_TIMER_MS): GameState {
  const board = createInitialBoard();
  const castlingRights = initialCastlingRights();
  const legalMoves = generateLegalMoves(board, 'white', ruleMapping, castlingRights, null);

  const initialKey = getBoardKey(board, 'white', castlingRights, null);

  return {
    board,
    turn: 'white',
    ruleMapping,
    castlingRights,
    enPassantSquare: null,
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    halfMoveClock: 0,
    fullMoveNumber: 1,
    status: 'playing',
    isCheck: false,
    legalMoves: legalMoves.map(m => ({ from: m.from, to: m.to, promotion: m.promotion })),
    timers: { white: initialTimerMs, black: initialTimerMs },
    lastMoveTimestamp: Date.now(),
    positionCounts: { [initialKey]: 1 },
  };
}

/**
 * Applies a validated move to the game state and returns the new state.
 * Returns null if the move is not in the legal move list.
 */
export function applyMove(
  state: GameState,
  from: number,
  to: number,
  promotion?: PieceType,
): GameState | null {
  // Find matching legal move
  const legalMoves = generateLegalMoves(
    state.board,
    state.turn,
    state.ruleMapping,
    state.castlingRights,
    state.enPassantSquare,
  );

  const matchingMoves = legalMoves.filter(m => {
    if (m.from !== from || m.to !== to) return false;
    if (m.promotion) return m.promotion === (promotion ?? 'queen');
    return true;
  });

  if (matchingMoves.length === 0) return null;

  // Use the first matching legal move (for promotions, exactly one will match)
  const move = matchingMoves[0];

  // Apply the move
  const { board, newCastlingRights, newEnPassantSquare, captured } =
    applyMoveToBoard(state.board, move, state.castlingRights);

  const nextTurn: Color = state.turn === 'white' ? 'black' : 'white';

  // Update captured pieces
  const capturedPieces = {
    white: [...state.capturedPieces.white],
    black: [...state.capturedPieces.black],
  };
  if (move.capturedPiece && !move.isEnPassant) {
    capturedPieces[nextTurn].push(move.capturedPiece);
  } else if (move.isEnPassant && move.capturedPiece) {
    capturedPieces[nextTurn].push(move.capturedPiece);
  }

  // Half-move clock (resets on pawn move or capture)
  const halfMoveClock =
    move.piece.type === 'pawn' || captured ? 0 : state.halfMoveClock + 1;

  const fullMoveNumber =
    nextTurn === 'white' ? state.fullMoveNumber + 1 : state.fullMoveNumber;

  // Detect check/checkmate/stalemate for next player
  const inCheck = isInCheck(board, nextTurn, state.ruleMapping);
  const gameEnd = detectGameEnd(
    board, nextTurn, state.ruleMapping, newCastlingRights, newEnPassantSquare,
  );

  // Determine game status
  let status: GameStatus = 'playing';
  let winner: Color | undefined = undefined;

  if (gameEnd) {
    if (gameEnd.type === 'checkmate') {
      status = 'checkmate';
      winner = gameEnd.winner;
    } else {
      status = 'stalemate';
    }
  }

  // Remove 50-move rule to allow n moves as per user request

  // Track position for 3-fold repetition
  const newPositionCounts = { ...state.positionCounts };
  const nextKey = getBoardKey(board, nextTurn, newCastlingRights, newEnPassantSquare);
  newPositionCounts[nextKey] = (newPositionCounts[nextKey] || 0) + 1;

  if (newPositionCounts[nextKey] >= 3 && status === 'playing') {
    status = 'draw';
  }

  // Compute legal moves for the next player (or empty if game is over)
  const nextLegalMoves =
    status === 'playing'
      ? generateLegalMoves(board, nextTurn, state.ruleMapping, newCastlingRights, newEnPassantSquare)
      : [];

  // Generate algebraic notation for the move
  const notation = generateNotation(move, state.board, inCheck, status === 'checkmate');
  const annotatedMove: Move = {
    ...move,
    notation,
    isCheck: inCheck && status !== 'checkmate',
    isCheckmate: status === 'checkmate',
  };

  // Deduct time for the player who just moved (handled by timer in roomManager)
  const now = Date.now();
  const elapsed = state.lastMoveTimestamp ? now - state.lastMoveTimestamp : 0;
  const newTimers = { ...state.timers };
  newTimers[state.turn] = Math.max(0, newTimers[state.turn] - elapsed);

  return {
    ...state,
    board,
    turn: nextTurn,
    castlingRights: newCastlingRights,
    enPassantSquare: newEnPassantSquare,
    moveHistory: [...state.moveHistory, annotatedMove],
    capturedPieces,
    halfMoveClock,
    fullMoveNumber,
    status,
    winner,
    isCheck: inCheck && status !== 'checkmate',
    legalMoves: nextLegalMoves.map(m => ({ from: m.from, to: m.to, promotion: m.promotion })),
    timers: newTimers,
    lastMoveTimestamp: now,
    positionCounts: newPositionCounts,
  };
}

/** Tick one second off the active player's clock. Returns new timers or null if time ran out. */
export function tickTimer(state: GameState): {
  timers: { white: number; black: number };
  timedOut: boolean;
} {
  const timers = { ...state.timers };
  timers[state.turn] = Math.max(0, timers[state.turn] - 1000);
  return {
    timers,
    timedOut: timers[state.turn] === 0,
  };
}
