import React from 'react';
import { Color, Piece } from '@chaos-chess/shared';
import { useGameStore } from '../store/gameStore';

interface CapturedPiecesProps {
  color: Color; // The player color whose captured pieces we want to display (meaning dead pieces of this color)
}

const PIECE_SYMBOLS: Record<string, string> = {
  pawn: '♟',
  knight: '♞',
  bishop: '♝',
  rook: '♜',
  queen: '♛',
};

const PIECE_VALUES: Record<string, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
};

export default function CapturedPieces({ color }: CapturedPiecesProps) {
  const { gameState } = useGameStore();

  if (!gameState) return null;

  // Let's grab the array of captured pieces of this color.
  // Wait, let's see. If the server pushes to capturedPieces[nextTurn], then:
  // - White moves, captures black piece. nextTurn is 'black'.
  //   So capturedPieces.black gets the black piece.
  // - Black moves, captures white piece. nextTurn is 'white'.
  //   So capturedPieces.white gets the white piece.
  // Therefore:
  // - gameState.capturedPieces.black contains captured black pieces.
  // - gameState.capturedPieces.white contains captured white pieces.
  const list = gameState.capturedPieces[color] || [];

  // Group by piece type
  const counts: Record<string, number> = {
    queen: 0,
    rook: 0,
    bishop: 0,
    knight: 0,
    pawn: 0,
  };

  list.forEach((p) => {
    if (p && counts[p.type] !== undefined) {
      counts[p.type]++;
    }
  });

  const order = ['queen', 'rook', 'bishop', 'knight', 'pawn'];

  return (
    <div className="flex items-center gap-1 min-h-6 text-sm">
      {order.map((type) => {
        const count = counts[type];
        if (count === 0) return null;
        return (
          <div key={type} className="flex items-center text-text-secondary select-none">
            <span className="text-base leading-none">
              {PIECE_SYMBOLS[type] || ''}
            </span>
            {count > 1 && <span className="text-[10px] font-bold ml-0.5">x{count}</span>}
          </div>
        );
      })}
    </div>
  );
}
