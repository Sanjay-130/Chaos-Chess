import { Board, Color, PieceType } from '@chaos-chess/shared';

export function getFile(index: number): number {
  return index % 8;
}

export function getRank(index: number): number {
  return Math.floor(index / 8);
}

export function squareToIndex(square: string): number {
  const file = square.charCodeAt(0) - 97; // 'a' = 97
  const rank = parseInt(square[1], 10) - 1;
  return rank * 8 + file;
}

export function indexToSquare(index: number): string {
  const file = String.fromCharCode(97 + (index % 8));
  const rank = Math.floor(index / 8) + 1;
  return `${file}${rank}`;
}

const PIECE_TO_LETTER: Record<Color, Record<PieceType, string>> = {
  white: { pawn: 'P', knight: 'N', bishop: 'B', rook: 'R', queen: 'Q', king: 'K' },
  black: { pawn: 'p', knight: 'n', bishop: 'b', rook: 'r', queen: 'q', king: 'k' },
};

export function boardToFen(board: Board): string {
  const rows: string[] = [];

  for (let rank = 7; rank >= 0; rank--) {
    let row = '';
    let empty = 0;

    for (let file = 0; file < 8; file++) {
      const piece = board[rank * 8 + file];
      if (!piece) {
        empty++;
      } else {
        if (empty > 0) {
          row += empty;
          empty = 0;
        }
        row += PIECE_TO_LETTER[piece.color][piece.type];
      }
    }
    if (empty > 0) {
      row += empty;
    }
    rows.push(row);
  }

  return rows.join('/');
}

export function boardToPositionObject(board: Board): Record<string, string> {
  const pos: Record<string, string> = {};
  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (piece) {
      const square = indexToSquare(i);
      const color = piece.color === 'white' ? 'w' : 'b';
      const type =
        piece.type === 'knight'
          ? 'N'
          : piece.type.charAt(0).toUpperCase();
      pos[square] = `${color}${type}`;
    }
  }
  return pos;
}
