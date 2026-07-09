import {
  Board, Color, Move, Piece, PieceType,
  RuleMapping, MoveStyle, CastlingRights,
} from '@chaos-chess/shared';
import { getFile, getRank } from './board';

// ─── Direction Tables ─────────────────────────────────────────────────────────

const ROOK_DIRS   = [1, -1, 8, -8] as const;
const BISHOP_DIRS = [9, 7, -9, -7] as const;
const QUEEN_DIRS  = [...ROOK_DIRS, ...BISHOP_DIRS] as const;

const KNIGHT_JUMPS = [
  { offset:  17, df:  1 },
  { offset:  15, df: -1 },
  { offset:  10, df:  2 },
  { offset:   6, df: -2 },
  { offset:  -6, df:  2 },
  { offset: -10, df: -2 },
  { offset: -15, df:  1 },
  { offset: -17, df: -1 },
] as const;

// ─── Ray Step Validity ────────────────────────────────────────────────────────
/**
 * Checks whether stepping from `from` to `to` in direction `dir` is on-board
 * without wrapping ranks/files. Prevents a1→b0 type off-board wraps.
 */
function isValidStep(from: number, to: number, dir: number): boolean {
  if (to < 0 || to > 63) return false;
  const fd = getFile(to) - getFile(from);
  switch (dir) {
    case  1: return fd ===  1;
    case -1: return fd === -1;
    case  8: return fd ===  0;
    case -8: return fd ===  0;
    case  9: return fd ===  1;
    case  7: return fd === -1;
    case -9: return fd === -1;
    case -7: return fd ===  1;
    default: return false;
  }
}

// ─── Ray Move Generator ───────────────────────────────────────────────────────

function generateRayMoves(
  from: number,
  dirs: readonly number[],
  board: Board,
  color: Color,
): Move[] {
  const moves: Move[] = [];
  const piece = board[from] as Piece;

  for (const dir of dirs) {
    let cur = from;
    while (true) {
      const next = cur + dir;
      if (!isValidStep(cur, next, dir)) break;
      const target = board[next];
      if (target === null) {
        moves.push({ from, to: next, piece });
        cur = next;
      } else {
        if (target.color !== color) {
          moves.push({ from, to: next, piece, capturedPiece: target });
        }
        break;
      }
    }
  }
  return moves;
}

// ─── Knight Move Generator ────────────────────────────────────────────────────

function generateKnightMoves(from: number, board: Board, color: Color): Move[] {
  const moves: Move[] = [];
  const piece = board[from] as Piece;
  const fromFile = getFile(from);

  for (const { offset, df } of KNIGHT_JUMPS) {
    const to = from + offset;
    if (to < 0 || to > 63) continue;
    if (getFile(to) - fromFile !== df) continue; // rank-wrap guard
    const target = board[to];
    if (target === null || target.color !== color) {
      moves.push({ from, to, piece, ...(target ? { capturedPiece: target } : {}) });
    }
  }
  return moves;
}

// ─── Pawn Move Generator ──────────────────────────────────────────────────────

const PROMOTION_TYPES: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

function generatePawnMoves(
  from: number,
  board: Board,
  color: Color,
  enPassantSquare: number | null,
): Move[] {
  const moves: Move[] = [];
  const piece = board[from] as Piece;
  const dir        = color === 'white' ? 8 : -8;
  const startRank  = color === 'white' ? 1 : 6;
  const promoRank  = color === 'white' ? 7 : 0;
  const fromRank   = getRank(from);
  const fromFile   = getFile(from);

  // Single push
  const one = from + dir;
  if (one >= 0 && one < 64 && board[one] === null) {
    if (getRank(one) === promoRank) {
      for (const p of PROMOTION_TYPES) moves.push({ from, to: one, piece, promotion: p });
    } else {
      moves.push({ from, to: one, piece });
      // Double push from starting rank
      if (fromRank === startRank) {
        const two = from + dir * 2;
        if (board[two] === null) moves.push({ from, to: two, piece });
      }
    }
  }

  // Captures
  const captureDirs = color === 'white'
    ? [{ to: from + 9, df: 1 }, { to: from + 7, df: -1 }]
    : [{ to: from - 7, df: 1 }, { to: from - 9, df: -1 }];

  for (const { to, df } of captureDirs) {
    if (to < 0 || to > 63) continue;
    if (getFile(to) - fromFile !== df) continue;

    const target = board[to];
    if (target && target.color !== color) {
      if (getRank(to) === promoRank) {
        for (const p of PROMOTION_TYPES)
          moves.push({ from, to, piece, promotion: p, capturedPiece: target });
      } else {
        moves.push({ from, to, piece, capturedPiece: target });
      }
    }

    // En passant
    if (enPassantSquare !== null && to === enPassantSquare) {
      const capturedSq = enPassantSquare + (color === 'white' ? -8 : 8);
      const capturedPawn = board[capturedSq];
      if (capturedPawn) {
        moves.push({ from, to, piece, isEnPassant: true, capturedPiece: capturedPawn });
      }
    }
  }

  return moves;
}

// ─── King Move Generator ──────────────────────────────────────────────────────

const KING_DIRS = [1, -1, 8, -8, 9, 7, -9, -7] as const;

function generateKingMoves(
  from: number,
  board: Board,
  color: Color,
  castlingRights: CastlingRights,
): Move[] {
  const moves: Move[] = [];
  const piece = board[from] as Piece;

  for (const dir of KING_DIRS) {
    const to = from + dir;
    if (!isValidStep(from, to, dir)) continue;
    const target = board[to];
    if (target === null || target.color !== color) {
      moves.push({ from, to, piece, ...(target ? { capturedPiece: target } : {}) });
    }
  }

  // Castling — squares between must be empty; check detection handled in validator
  if (color === 'white' && from === 4) {
    if (
      castlingRights.whiteKingside &&
      board[5] === null && board[6] === null &&
      board[7]?.type === 'rook' && board[7]?.color === 'white'
    ) {
      moves.push({ from, to: 6, piece, isCastle: 'kingside' });
    }
    if (
      castlingRights.whiteQueenside &&
      board[3] === null && board[2] === null && board[1] === null &&
      board[0]?.type === 'rook' && board[0]?.color === 'white'
    ) {
      moves.push({ from, to: 2, piece, isCastle: 'queenside' });
    }
  }

  if (color === 'black' && from === 60) {
    if (
      castlingRights.blackKingside &&
      board[61] === null && board[62] === null &&
      board[63]?.type === 'rook' && board[63]?.color === 'black'
    ) {
      moves.push({ from, to: 62, piece, isCastle: 'kingside' });
    }
    if (
      castlingRights.blackQueenside &&
      board[59] === null && board[58] === null && board[57] === null &&
      board[56]?.type === 'rook' && board[56]?.color === 'black'
    ) {
      moves.push({ from, to: 58, piece, isCastle: 'queenside' });
    }
  }

  return moves;
}

// ─── Style Dispatcher ─────────────────────────────────────────────────────────

export function getMoveStyleForPiece(
  pieceType: PieceType,
  ruleMapping: RuleMapping,
): MoveStyle | null {
  switch (pieceType) {
    case 'queen':  return ruleMapping.queen;
    case 'rook':   return ruleMapping.rook;
    case 'bishop': return ruleMapping.bishop;
    case 'knight': return ruleMapping.knight;
    default:       return null;
  }
}

export function generateMovesByStyle(
  from: number,
  board: Board,
  color: Color,
  style: MoveStyle,
): Move[] {
  switch (style) {
    case 'queen':  return generateRayMoves(from, QUEEN_DIRS, board, color);
    case 'rook':   return generateRayMoves(from, ROOK_DIRS, board, color);
    case 'bishop': return generateRayMoves(from, BISHOP_DIRS, board, color);
    case 'knight': return generateKnightMoves(from, board, color);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Generates pseudo-legal moves for a single piece on the given square. */
export function generatePseudoLegalMovesForSquare(
  from: number,
  board: Board,
  color: Color,
  ruleMapping: RuleMapping,
  castlingRights: CastlingRights,
  enPassantSquare: number | null,
): Move[] {
  const piece = board[from];
  if (!piece || piece.color !== color) return [];

  switch (piece.type) {
    case 'pawn':   return generatePawnMoves(from, board, color, enPassantSquare);
    case 'king':   return generateKingMoves(from, board, color, castlingRights);
    default: {
      const style = getMoveStyleForPiece(piece.type, ruleMapping)!;
      return generateMovesByStyle(from, board, color, style);
    }
  }
}

/** Generates all pseudo-legal moves for all pieces of a given color. */
export function generateAllPseudoLegalMoves(
  board: Board,
  color: Color,
  ruleMapping: RuleMapping,
  castlingRights: CastlingRights,
  enPassantSquare: number | null,
): Move[] {
  const moves: Move[] = [];
  for (let i = 0; i < 64; i++) {
    if (board[i]?.color === color) {
      moves.push(...generatePseudoLegalMovesForSquare(
        i, board, color, ruleMapping, castlingRights, enPassantSquare,
      ));
    }
  }
  return moves;
}
