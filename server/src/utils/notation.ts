import { Move, Board, PieceType } from '@chaos-chess/shared';
import { getFile, getRank, indexToSquare } from '../engine/board';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const PIECE_LETTER: Partial<Record<PieceType, string>> = {
  knight: 'N',
  bishop: 'B',
  rook: 'R',
  queen: 'Q',
  king: 'K',
};

const PROMO_LETTER: Record<PieceType, string> = {
  queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: '', king: '',
};

/**
 * Generates standard algebraic notation for a move.
 * Note: disambiguation is not fully implemented in V1 (rare edge case).
 */
export function generateNotation(
  move: Move,
  _boardBefore: Board,
  isCheck: boolean,
  isCheckmate: boolean,
): string {
  const suffix = isCheckmate ? '#' : isCheck ? '+' : '';

  if (move.isCastle) {
    return move.isCastle === 'kingside' ? `O-O${suffix}` : `O-O-O${suffix}`;
  }

  const piece = move.piece;
  const toSquare = indexToSquare(move.to);

  if (piece.type === 'pawn') {
    let notation = '';
    if (move.capturedPiece || move.isEnPassant) {
      notation = `${FILES[getFile(move.from)]}x${toSquare}`;
    } else {
      notation = toSquare;
    }
    if (move.promotion) {
      notation += `=${PROMO_LETTER[move.promotion]}`;
    }
    return notation + suffix;
  }

  const letter = PIECE_LETTER[piece.type] ?? '';
  const capture = move.capturedPiece ? 'x' : '';
  return `${letter}${capture}${toSquare}${suffix}`;
}
