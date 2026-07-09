import { Board, Color, RuleMapping, MoveStyle } from '@chaos-chess/shared';
import { getFile, getRank } from './board';
import { getMoveStyleForPiece } from './moveGenerator';

// ─── Direction Tables (same as moveGenerator, kept local to avoid coupling) ──

const ROOK_DIRS   = [1, -1, 8, -8] as const;
const BISHOP_DIRS = [9, 7, -9, -7] as const;
const QUEEN_DIRS  = [...ROOK_DIRS, ...BISHOP_DIRS] as const;

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

// ─── Ray Attack Check ─────────────────────────────────────────────────────────

function canRayAttack(
  from: number,
  target: number,
  dirs: readonly number[],
  board: Board,
): boolean {
  for (const dir of dirs) {
    let cur = from;
    while (true) {
      const next = cur + dir;
      if (!isValidStep(cur, next, dir)) break;
      if (next === target) return true;
      if (board[next] !== null) break;
      cur = next;
    }
  }
  return false;
}

// ─── Knight Attack Check ──────────────────────────────────────────────────────

function canKnightAttack(from: number, target: number): boolean {
  const fd = Math.abs(getFile(target) - getFile(from));
  const rd = Math.abs(getRank(target) - getRank(from));
  return (fd === 1 && rd === 2) || (fd === 2 && rd === 1);
}

// ─── Style-based Attack Dispatcher ───────────────────────────────────────────

function canAttackByStyle(
  from: number,
  target: number,
  style: MoveStyle,
  board: Board,
): boolean {
  switch (style) {
    case 'queen':  return canRayAttack(from, target, QUEEN_DIRS,  board);
    case 'rook':   return canRayAttack(from, target, ROOK_DIRS,   board);
    case 'bishop': return canRayAttack(from, target, BISHOP_DIRS, board);
    case 'knight': return canKnightAttack(from, target);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns true if `square` is attacked by any piece of `attackerColor`,
 * using the current rule mapping to determine movement styles.
 */
export function isSquareAttackedBy(
  square: number,
  attackerColor: Color,
  board: Board,
  ruleMapping: RuleMapping,
): boolean {
  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (!piece || piece.color !== attackerColor) continue;

    if (piece.type === 'king') {
      const fd = Math.abs(getFile(square) - getFile(i));
      const rd = Math.abs(getRank(square) - getRank(i));
      if (fd <= 1 && rd <= 1 && (fd + rd) > 0) return true;
      continue;
    }

    if (piece.type === 'pawn') {
      // Pawns attack diagonally forward
      const rankDir = attackerColor === 'white' ? 1 : -1;
      const fd = getFile(square) - getFile(i);
      const rd = getRank(square) - getRank(i);
      if (rd === rankDir && (fd === 1 || fd === -1)) return true;
      continue;
    }

    const style = getMoveStyleForPiece(piece.type, ruleMapping)!;
    if (canAttackByStyle(i, square, style, board)) return true;
  }

  return false;
}
