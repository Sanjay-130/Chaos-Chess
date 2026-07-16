import React, { useState, useMemo, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { useGameStore } from '../store/gameStore';
import { boardToFen, indexToSquare } from '../utils/boardUtils';
import { Board, Move, PieceType } from '@chaos-chess/shared';

// ─── Board reconstruction helpers ────────────────────────────────────────────

function createInitialBoard(): Board {
  const board: Board = new Array(64).fill(null);
  const backRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let i = 0; i < 8; i++) {
    board[i]      = { type: backRank[i], color: 'white' };
    board[i + 8]  = { type: 'pawn',      color: 'white' };
    board[56 + i] = { type: backRank[i], color: 'black' };
    board[48 + i] = { type: 'pawn',      color: 'black' };
  }
  return board;
}

function applyMoveToBoard(board: Board, move: Move): Board {
  const b = [...board];
  // Place (with optional promotion)
  b[move.to]   = move.promotion ? { type: move.promotion, color: move.piece.color } : { ...move.piece };
  b[move.from] = null;
  // Castling — move rook
  if (move.isCastle) {
    const rank = move.piece.color === 'white' ? 0 : 7;
    if (move.isCastle === 'kingside') {
      b[rank * 8 + 5] = b[rank * 8 + 7];
      b[rank * 8 + 7] = null;
    } else {
      b[rank * 8 + 3] = b[rank * 8 + 0];
      b[rank * 8 + 0] = null;
    }
  }
  // En passant — remove captured pawn
  if (move.isEnPassant) {
    const capturedIdx = move.piece.color === 'white' ? move.to - 8 : move.to + 8;
    b[capturedIdx] = null;
  }
  return b;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface GameReviewProps {
  onClose: () => void;
}

export default function GameReview({ onClose }: GameReviewProps) {
  const { gameState, playerColor } = useGameStore();
  const [reviewIndex, setReviewIndex] = useState(gameState?.moveHistory.length ?? 0);
  const [boardWidth, setBoardWidth] = useState(Math.min(window.innerWidth - 80, 460));

  useEffect(() => {
    const handleResize = () => setBoardWidth(Math.min(window.innerWidth - 80, 460));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  setReviewIndex(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setReviewIndex(i => Math.min((gameState?.moveHistory.length ?? 0), i + 1));
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, onClose]);

  // Pre-compute all board snapshots once
  const boardSnapshots = useMemo(() => {
    const initial = createInitialBoard();
    if (!gameState) return [initial];
    const snaps: Board[] = [initial];
    for (const move of gameState.moveHistory) {
      snaps.push(applyMoveToBoard(snaps[snaps.length - 1], move));
    }
    return snaps;
  }, [gameState]);

  if (!gameState) return null;

  const totalMoves   = gameState.moveHistory.length;
  const currentBoard = boardSnapshots[reviewIndex];
  const currentFen   = boardToFen(currentBoard);
  const currentMove  = reviewIndex > 0 ? gameState.moveHistory[reviewIndex - 1] : null;
  const moveNumber   = Math.ceil(reviewIndex / 2);

  // Highlight the squares involved in the current move
  const customSquareStyles: Record<string, React.CSSProperties> = {};
  if (reviewIndex > 0 && currentMove) {
    customSquareStyles[indexToSquare(currentMove.from)] = { backgroundColor: 'rgba(234, 179, 8, 0.35)' };
    customSquareStyles[indexToSquare(currentMove.to)]   = { backgroundColor: 'rgba(234, 179, 8, 0.55)' };
  }

  const moveListItems = Array.from({ length: Math.ceil(totalMoves / 2) }).map((_, i) => {
    const wi = i * 2 + 1;
    const bi = i * 2 + 2;
    return {
      num:   i + 1,
      white: { idx: wi, notation: gameState.moveHistory[wi - 1]?.notation ?? '' },
      black: { idx: bi, notation: gameState.moveHistory[bi - 1]?.notation ?? '' },
    };
  });

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="panel overflow-hidden"
        style={{ width: '100%', maxWidth: 720, margin: '0 16px', display: 'flex', flexDirection: 'column', maxHeight: '95vh' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-dim flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-black tracking-widest text-gradient">GAME REVIEW</h2>
            <p className="text-[10px] text-text-secondary mt-0.5">
              {reviewIndex === 0
                ? 'Starting position'
                : `Move ${moveNumber} — ${currentMove?.piece.color?.toUpperCase()} plays ${currentMove?.notation}`}
              <span className="ml-2 text-text-dim">({reviewIndex} / {totalMoves})</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-dim hidden md:block">← → to navigate • ESC to close</span>
            <button onClick={onClose} className="btn btn-secondary btn-sm">✕ CLOSE</button>
          </div>
        </div>

        {/* Body: board + move list */}
        <div className="flex flex-col md:flex-row overflow-hidden flex-grow">
          {/* Board */}
          <div className="flex items-center justify-center p-4 flex-shrink-0">
            <div>
              <Chessboard
                position={currentFen}
                boardWidth={boardWidth}
                boardOrientation={playerColor === 'black' ? 'black' : 'white'}
                arePiecesDraggable={false}
                customSquareStyles={customSquareStyles}
                customDarkSquareStyle={{ backgroundColor: '#131920' }}
                customLightSquareStyle={{ backgroundColor: '#1e2d3d' }}
                animationDuration={150}
              />

              {/* Nav buttons below board */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  onClick={() => setReviewIndex(0)}
                  disabled={reviewIndex === 0}
                  className="btn btn-secondary btn-sm"
                  title="Go to start"
                >⏮</button>
                <button
                  onClick={() => setReviewIndex(i => Math.max(0, i - 1))}
                  disabled={reviewIndex === 0}
                  className="btn btn-secondary btn-sm"
                  title="Previous move"
                >◀ PREV</button>
                <button
                  onClick={() => setReviewIndex(i => Math.min(totalMoves, i + 1))}
                  disabled={reviewIndex === totalMoves}
                  className="btn btn-primary btn-sm"
                  title="Next move"
                >NEXT ▶</button>
                <button
                  onClick={() => setReviewIndex(totalMoves)}
                  disabled={reviewIndex === totalMoves}
                  className="btn btn-primary btn-sm"
                  title="Go to end"
                >⏭</button>
              </div>
            </div>
          </div>

          {/* Move list + Rule Mapping sidebar */}
          <div className="flex-grow overflow-y-auto p-4 border-t md:border-t-0 md:border-l border-border-dim flex flex-col gap-4">

            {/* ── Active Rule Mapping ── */}
            <div>
              <div className="text-[10px] font-bold tracking-widest text-text-accent mb-2">PIECE SWAPS THIS GAME</div>
              <div className="space-y-1">
                {(['queen', 'rook', 'bishop', 'knight'] as const).map((piece) => {
                  const movesLike = gameState.ruleMapping[piece];
                  const isSwapped = movesLike !== piece;
                  const pieceIcons: Record<string, string> = {
                    queen: '♛', rook: '♜', bishop: '♝', knight: '♞',
                  };
                  return (
                    <div
                      key={piece}
                      className="flex items-center justify-between px-2 py-1.5 rounded text-xs font-mono"
                      style={{
                        background: isSwapped ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isSwapped ? 'rgba(99,102,241,0.35)' : '#1e2d3d'}`,
                      }}
                    >
                      <span style={{ color: isSwapped ? '#a5b4fc' : '#7c8fa6' }}>
                        {pieceIcons[piece]} {piece.toUpperCase()}
                      </span>
                      <span style={{ color: '#3d5166' }}>moves like</span>
                      <span
                        style={{
                          color: isSwapped ? '#f0f6ff' : '#7c8fa6',
                          fontWeight: isSwapped ? 700 : 400,
                        }}
                      >
                        {pieceIcons[movesLike]} {movesLike.toUpperCase()}{isSwapped ? ' ⚡' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-text-dim mt-1.5">King &amp; Pawn always move normally.</p>
            </div>

            {/* ── Move List ── */}
            <div className="flex-grow">
              <div className="text-[10px] font-bold tracking-widest text-text-accent mb-2">MOVE LIST</div>
              <div className="space-y-0.5">
                {moveListItems.map(({ num, white, black }) => (
                  <div key={num} className="grid grid-cols-[28px_1fr_1fr] gap-1 items-center text-xs">
                    <span className="text-text-dim font-mono">{num}.</span>
                    <button
                      onClick={() => setReviewIndex(white.idx)}
                      className="text-left px-2 py-1 font-mono rounded transition-colors"
                      style={{
                        background: reviewIndex === white.idx ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                        color:      reviewIndex === white.idx ? '#f0f6ff' : '#7c8fa6',
                        border:     reviewIndex === white.idx ? '1px solid rgba(37,99,235,0.4)' : '1px solid transparent',
                      }}
                    >
                      {white.notation}
                    </button>
                    <button
                      onClick={() => { if (black.notation) setReviewIndex(black.idx); }}
                      disabled={!black.notation}
                      className="text-left px-2 py-1 font-mono rounded transition-colors"
                      style={{
                        background: reviewIndex === black.idx ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                        color:      reviewIndex === black.idx ? '#f0f6ff' : '#7c8fa6',
                        border:     reviewIndex === black.idx ? '1px solid rgba(37,99,235,0.4)' : '1px solid transparent',
                      }}
                    >
                      {black.notation}
                    </button>
                  </div>
                ))}
                {totalMoves === 0 && (
                  <p className="text-text-dim text-xs">No moves recorded.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
