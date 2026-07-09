import { Board, Piece, PieceType, Color, CastlingRights } from '@chaos-chess/shared';

// ─── Board Indexing ───────────────────────────────────────────────────────────
// Index = rank * 8 + file
// a1=0, b1=1, ..., h1=7
// a2=8, b2=9, ..., h2=15
// ...
// a8=56, b8=57, ..., h8=63

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

export function isValidIndex(index: number): boolean {
  return index >= 0 && index < 64;
}

// ─── Board Creation ───────────────────────────────────────────────────────────

const BACK_RANK_ORDER: PieceType[] = [
  'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook',
];

export function createInitialBoard(): Board {
  const board: Board = new Array(64).fill(null);

  for (let file = 0; file < 8; file++) {
    // White back rank (rank 1 = indices 0–7)
    board[file] = { type: BACK_RANK_ORDER[file], color: 'white' };
    // White pawns (rank 2 = indices 8–15)
    board[8 + file] = { type: 'pawn', color: 'white' };
    // Black pawns (rank 7 = indices 48–55)
    board[48 + file] = { type: 'pawn', color: 'black' };
    // Black back rank (rank 8 = indices 56–63)
    board[56 + file] = { type: BACK_RANK_ORDER[file], color: 'black' };
  }

  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map(p => (p ? { ...p } : null));
}

// ─── King Locator ────────────────────────────────────────────────────────────

export function findKing(board: Board, color: Color): number {
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (p && p.type === 'king' && p.color === color) return i;
  }
  throw new Error(`King not found for ${color}`);
}

// ─── Initial Castling Rights ─────────────────────────────────────────────────

export function initialCastlingRights(): CastlingRights {
  return {
    whiteKingside: true,
    whiteQueenside: true,
    blackKingside: true,
    blackQueenside: true,
  };
}

// ─── FEN Generation (for client board display) ───────────────────────────────

const PIECE_TO_FEN: Record<Color, Record<PieceType, string>> = {
  white: { pawn: 'P', knight: 'N', bishop: 'B', rook: 'R', queen: 'Q', king: 'K' },
  black: { pawn: 'p', knight: 'n', bishop: 'b', rook: 'r', queen: 'q', king: 'k' },
};

/** Convert internal board array to a FEN position string */
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
        if (empty > 0) { row += empty; empty = 0; }
        row += PIECE_TO_FEN[piece.color][piece.type];
      }
    }
    if (empty > 0) row += empty;
    rows.push(row);
  }

  return rows.join('/');
}

/** Convert board to react-chessboard position object format */
export function boardToPositionObject(board: Board): Record<string, string> {
  const pos: Record<string, string> = {};
  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (piece) {
      const square = indexToSquare(i);
      const color = piece.color === 'white' ? 'w' : 'b';
      const type = piece.type === 'knight' ? 'N' :
        piece.type.charAt(0).toUpperCase();
      const adjustedType = piece.type === 'knight' ? 'N' :
        piece.type.charAt(0).toUpperCase() + piece.type.slice(1).charAt(0).toUpperCase().slice(-1);
      const pieceCode =
        color +
        (piece.type === 'knight' ? 'N' :
          piece.type === 'pawn' ? 'P' :
          piece.type === 'rook' ? 'R' :
          piece.type === 'bishop' ? 'B' :
          piece.type === 'queen' ? 'Q' :
          piece.type === 'king' ? 'K' : '?');
      pos[square] = pieceCode;
    }
  }
  return pos;
}
