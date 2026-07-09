import { Board, Color, Move, RuleMapping, CastlingRights } from '@chaos-chess/shared';
import { findKing } from './board';
import { isSquareAttackedBy } from './attackDetector';
import { applyMoveToBoard } from './moveApplicator';
import {
  generateAllPseudoLegalMoves,
  generatePseudoLegalMovesForSquare,
} from './moveGenerator';

const enemy = (c: Color): Color => (c === 'white' ? 'black' : 'white');

/**
 * Returns true if a move is fully legal:
 *  1. Own king not in check after the move.
 *  2. For castling: king not in check, not passing through check.
 */
export function isMoveLegal(
  move: Move,
  board: Board,
  color: Color,
  ruleMapping: RuleMapping,
  castlingRights: CastlingRights,
): boolean {
  const opp = enemy(color);

  // ── Castling extra checks ─────────────────────────────────────────────────
  if (move.isCastle) {
    // King must not currently be in check
    if (isSquareAttackedBy(move.from, opp, board, ruleMapping)) return false;

    // King must not pass through an attacked square
    const passSquare = move.isCastle === 'kingside' ? move.from + 1 : move.from - 1;
    if (isSquareAttackedBy(passSquare, opp, board, ruleMapping)) return false;
  }

  // ── Simulate and verify king safety ──────────────────────────────────────
  const { board: resultBoard } = applyMoveToBoard(board, move, castlingRights);
  const kingSquare = findKing(resultBoard, color);
  return !isSquareAttackedBy(kingSquare, opp, resultBoard, ruleMapping);
}

/** Generate all fully legal moves for a given color. */
export function generateLegalMoves(
  board: Board,
  color: Color,
  ruleMapping: RuleMapping,
  castlingRights: CastlingRights,
  enPassantSquare: number | null,
): Move[] {
  const pseudo = generateAllPseudoLegalMoves(
    board, color, ruleMapping, castlingRights, enPassantSquare,
  );
  return pseudo.filter(m =>
    isMoveLegal(m, board, color, ruleMapping, castlingRights),
  );
}

/** Generate legal moves only for the piece on a specific square. */
export function getLegalMovesForSquare(
  from: number,
  board: Board,
  color: Color,
  ruleMapping: RuleMapping,
  castlingRights: CastlingRights,
  enPassantSquare: number | null,
): Move[] {
  const pseudo = generatePseudoLegalMovesForSquare(
    from, board, color, ruleMapping, castlingRights, enPassantSquare,
  );
  return pseudo.filter(m =>
    isMoveLegal(m, board, color, ruleMapping, castlingRights),
  );
}

/** Returns true if the given color's king is currently in check. */
export function isInCheck(
  board: Board,
  color: Color,
  ruleMapping: RuleMapping,
): boolean {
  const kingSquare = findKing(board, color);
  return isSquareAttackedBy(kingSquare, enemy(color), board, ruleMapping);
}

export type GameEndResult =
  | { type: 'checkmate'; winner: Color }
  | { type: 'stalemate' }
  | null;

/**
 * After applying a move, determine if the game has ended for the player
 * whose turn it now is (i.e., the side that just had a move played against them).
 */
export function detectGameEnd(
  board: Board,
  colorToMove: Color,
  ruleMapping: RuleMapping,
  castlingRights: CastlingRights,
  enPassantSquare: number | null,
): GameEndResult {
  const legalMoves = generateLegalMoves(
    board, colorToMove, ruleMapping, castlingRights, enPassantSquare,
  );

  if (legalMoves.length > 0) return null;

  const inCheck = isInCheck(board, colorToMove, ruleMapping);

  if (inCheck) {
    return { type: 'checkmate', winner: colorToMove === 'white' ? 'black' : 'white' };
  } else {
    return { type: 'stalemate' };
  }
}
