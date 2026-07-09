import React, { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { boardToFen, squareToIndex, indexToSquare } from '../utils/boardUtils';
import { socket } from '../socket/socket';
import { SOCKET_EVENTS } from '@chaos-chess/shared';

export default function ChessBoardComponent() {
  const { gameState, playerColor, isSpectator, roomCode } = useGameStore();
  const {
    selectedSquare,
    legalMoves,
    setSelectedSquare,
    setLegalMoves,
    setPromotionSquare,
  } = useUIStore();

  const [boardWidth, setBoardWidth] = useState(480);

  // Resize board dynamically to fit containers
  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(window.innerWidth - 32, 480);
      setBoardWidth(width);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!gameState) return null;

  const fen = boardToFen(gameState.board);
  const myTurn = gameState.turn === playerColor;
  const isPlaying = gameState.status === 'playing';
  const canMove = !isSpectator && myTurn && isPlaying;

  // Retrieve legal moves for a given source square
  const getLegalTargets = (sourceSq: string): string[] => {
    const sourceIdx = squareToIndex(sourceSq);
    const targets = gameState.legalMoves
      .filter((m) => m.from === sourceIdx)
      .map((m) => indexToSquare(m.to));
    return targets;
  };

  const handlePieceDragStart = (piece: string, square: string) => {
    if (!canMove) return false;
    // Ensure dragged piece matches player color
    const pieceColor = piece.charAt(0);
    if (pieceColor !== playerColor?.charAt(0)) return false;

    // Show highlights
    const targets = getLegalTargets(square);
    setSelectedSquare(square);
    setLegalMoves(targets);
    return true;
  };

  const handlePieceDrop = (sourceSq: string, targetSq: string) => {
    if (!canMove) return false;

    const fromIdx = squareToIndex(sourceSq);
    const toIdx = squareToIndex(targetSq);

    // Verify if move is legal
    const match = gameState.legalMoves.find(
      (m) => m.from === fromIdx && m.to === toIdx
    );

    if (!match) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return false;
    }

    // Check if promotion is required
    const isPawn = gameState.board[fromIdx]?.type === 'pawn';
    const toRank = Math.floor(toIdx / 8);
    const isPromoRank = (playerColor === 'white' && toRank === 7) || (playerColor === 'black' && toRank === 0);

    if (isPawn && isPromoRank) {
      // Trigger promotion modal instead of making move immediately
      setPromotionSquare({ from: fromIdx, to: toIdx });
      setSelectedSquare(null);
      setLegalMoves([]);
      return true;
    }

    // Emit normal move
    socket.emit(SOCKET_EVENTS.MAKE_MOVE, {
      code: roomCode,
      from: fromIdx,
      to: toIdx,
    });

    setSelectedSquare(null);
    setLegalMoves([]);
    return true;
  };

  const handleSquareClick = (square: string) => {
    if (!canMove) return;

    // If a target from legal moves is clicked, apply move
    if (selectedSquare && legalMoves.includes(square)) {
      handlePieceDrop(selectedSquare, square);
      return;
    }

    const idx = squareToIndex(square);
    const piece = gameState.board[idx];

    // Select own piece
    if (piece && piece.color === playerColor) {
      const targets = getLegalTargets(square);
      setSelectedSquare(square);
      setLegalMoves(targets);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Build custom square styles for highlight/selected states
  const customSquareStyles: Record<string, React.CSSProperties> = {};

  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: 'rgba(37, 99, 235, 0.4)',
    };
  }

  legalMoves.forEach((sq) => {
    const idx = squareToIndex(sq);
    const isCapture = gameState.board[idx] !== null;

    customSquareStyles[sq] = {
      background: isCapture
        ? 'radial-gradient(circle, transparent 60%, rgba(37, 99, 235, 0.6) 65%)'
        : 'radial-gradient(circle, rgba(37, 99, 235, 0.6) 24%, transparent 25%)',
    };
  });

  // Highlight King in check
  if (gameState.isCheck && isPlaying) {
    // Find King index
    for (let i = 0; i < 64; i++) {
      const p = gameState.board[i];
      if (p && p.type === 'king' && p.color === gameState.turn) {
        customSquareStyles[indexToSquare(i)] = {
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.6) 60%, transparent 65%)',
          boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
        };
        break;
      }
    }
  }

  return (
    <div className="board-wrapper panel p-2 bg-bg-card border border-border flex items-center justify-center">
      <Chessboard
        position={fen}
        boardWidth={boardWidth}
        boardOrientation={playerColor === 'black' ? 'black' : 'white'}
        arePiecesDraggable={isPlaying && !isSpectator}
        onPieceDragBegin={handlePieceDragStart}
        onPieceDrop={handlePieceDrop}
        onSquareClick={handleSquareClick}
        customSquareStyles={customSquareStyles}
        customDarkSquareStyle={{ backgroundColor: '#131920' }}
        customLightSquareStyle={{ backgroundColor: '#1e2d3d' }}
      />
    </div>
  );
}
