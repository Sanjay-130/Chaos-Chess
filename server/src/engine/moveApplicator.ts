import { Board, Move, Color, CastlingRights } from '@chaos-chess/shared';
import { cloneBoard, getFile, getRank } from './board';

export interface ApplyMoveResult {
  board: Board;
  newCastlingRights: CastlingRights;
  newEnPassantSquare: number | null;
  captured: boolean;
}

/**
 * Apply a move to a board copy and return the resulting state.
 * Does NOT check legality — call moveValidator first.
 */
export function applyMoveToBoard(
  board: Board,
  move: Move,
  castlingRights: CastlingRights
): ApplyMoveResult {
  const newBoard = cloneBoard(board);
  const piece = newBoard[move.from]!;
  const color = piece.color;

  let newCastlingRights: CastlingRights = { ...castlingRights };
  let newEnPassantSquare: number | null = null;
  let captured = false;

  // ── Castling ──────────────────────────────────────────────────────────────
  if (move.isCastle) {
    newBoard[move.to] = piece;
    newBoard[move.from] = null;

    if (move.isCastle === 'kingside') {
      const rookFrom = color === 'white' ? 7 : 63;
      const rookTo   = color === 'white' ? 5 : 61;
      newBoard[rookTo]   = newBoard[rookFrom];
      newBoard[rookFrom] = null;
    } else {
      const rookFrom = color === 'white' ? 0 : 56;
      const rookTo   = color === 'white' ? 3 : 59;
      newBoard[rookTo]   = newBoard[rookFrom];
      newBoard[rookFrom] = null;
    }

    if (color === 'white') {
      newCastlingRights.whiteKingside  = false;
      newCastlingRights.whiteQueenside = false;
    } else {
      newCastlingRights.blackKingside  = false;
      newCastlingRights.blackQueenside = false;
    }

    return { board: newBoard, newCastlingRights, newEnPassantSquare, captured: false };
  }

  // ── En Passant ────────────────────────────────────────────────────────────
  if (move.isEnPassant) {
    newBoard[move.to]   = piece;
    newBoard[move.from] = null;
    const capturedPawnSquare = move.to + (color === 'white' ? -8 : 8);
    newBoard[capturedPawnSquare] = null;
    return { board: newBoard, newCastlingRights, newEnPassantSquare, captured: true };
  }

  // ── Normal Move ───────────────────────────────────────────────────────────
  if (newBoard[move.to] !== null) captured = true;

  // Promotion: replace pawn with promoted piece
  newBoard[move.to]   = move.promotion
    ? { type: move.promotion, color }
    : piece;
  newBoard[move.from] = null;

  // En passant square: set when pawn advances two squares
  if (piece.type === 'pawn') {
    const rankDiff = Math.abs(getRank(move.to) - getRank(move.from));
    if (rankDiff === 2) {
      newEnPassantSquare = Math.round((move.from + move.to) / 2);
    }
  }

  // Revoke castling rights when king or rook moves
  if (piece.type === 'king') {
    if (color === 'white') {
      newCastlingRights.whiteKingside  = false;
      newCastlingRights.whiteQueenside = false;
    } else {
      newCastlingRights.blackKingside  = false;
      newCastlingRights.blackQueenside = false;
    }
  }

  if (piece.type === 'rook') {
    if (move.from === 0)  newCastlingRights.whiteQueenside = false;
    if (move.from === 7)  newCastlingRights.whiteKingside  = false;
    if (move.from === 56) newCastlingRights.blackQueenside = false;
    if (move.from === 63) newCastlingRights.blackKingside  = false;
  }

  // Revoke castling rights when a rook is captured on its home square
  if (move.to === 0)  newCastlingRights.whiteQueenside = false;
  if (move.to === 7)  newCastlingRights.whiteKingside  = false;
  if (move.to === 56) newCastlingRights.blackQueenside = false;
  if (move.to === 63) newCastlingRights.blackKingside  = false;

  return { board: newBoard, newCastlingRights, newEnPassantSquare, captured };
}
