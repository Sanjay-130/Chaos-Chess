import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { socket } from '../socket/socket';
import { SOCKET_EVENTS } from '@chaos-chess/shared';

import ChessBoardComponent from '../components/ChessBoardComponent';
import PlayerTimer from '../components/PlayerTimer';
import CapturedPieces from '../components/CapturedPieces';
import MoveHistory from '../components/MoveHistory';
import PromotionModal from '../components/PromotionModal';
import GameOverOverlay from '../components/GameOverOverlay';
import SpectatorBadge from '../components/SpectatorBadge';
import GameReview from '../components/GameReview';

export default function GamePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [showReview, setShowReview] = useState(false);

  const {
    roomState,
    gameState,
    playerColor,
    isSpectator,
    roomCode,
    nickname,
    drawOfferFrom,
    setDrawOfferFrom,
  } = useGameStore();

  const { errorMessage, setErrorMessage } = useUIStore();

  // Reconnection check
  useEffect(() => {
    if (!roomState && code) {
      if (nickname) {
        socket.emit(SOCKET_EVENTS.RECONNECT, { code, nickname });
      } else {
        navigate(`/join/${code}`);
      }
    }
  }, [roomState, code, nickname, navigate]);

  // Redirect back to waiting room / countdown overlay if phase changes back
  useEffect(() => {
    if (roomState && (roomState.phase === 'waiting' || roomState.phase === 'countdown')) {
      navigate(`/room/${code}`);
    }
  }, [roomState, code, navigate]);

  if (!roomState || !gameState) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="conn-dot connecting" />
        <div className="text-text-secondary font-semibold">SYNCHRONIZING GAME STATE...</div>
      </div>
    );
  }

  const players = roomState.players || [];
  const whitePlayer = players.find((p) => p.color === 'white');
  const blackPlayer = players.find((p) => p.color === 'black');

  // Determine opponent and own display info
  const myInfo = playerColor === 'white' ? whitePlayer : blackPlayer;
  const oppInfo = playerColor === 'white' ? blackPlayer : whitePlayer;

  const isMyTurn = gameState.turn === playerColor && gameState.status === 'playing';

  const handleResign = () => {
    if (window.confirm('Are you sure you want to resign?')) {
      socket.emit(SOCKET_EVENTS.RESIGN, { code: roomCode });
    }
  };

  const handleOfferDraw = () => {
    socket.emit(SOCKET_EVENTS.DRAW_OFFER, { code: roomCode });
    setErrorMessage('Draw offer sent.');
    setTimeout(() => setErrorMessage(null), 3000);
  };

  const handleDrawResponse = (accept: boolean) => {
    socket.emit(SOCKET_EVENTS.DRAW_RESPONSE, { code: roomCode, accept });
    setDrawOfferFrom(null);
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-6 animate-fade-in flex flex-col min-h-[90vh]">
      {/* Game Review Modal */}
      {showReview && <GameReview onClose={() => setShowReview(false)} />}

      {/* Promotion Modal Overlay */}
      <PromotionModal />

      {/* Top Header Bar */}
      <div className="panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-black tracking-wider text-gradient">CHAOS PLAY</h1>
            <p className="text-[10px] text-text-secondary font-mono uppercase">
              ROOM: {roomCode}
            </p>
          </div>
          {isSpectator && <SpectatorBadge />}
          {roomState.spectators?.length > 0 && (
            <span className="badge badge-gray font-bold">
              {roomState.spectators.length} SPECTATOR{roomState.spectators.length > 1 ? 'S' : ''}
            </span>
          )}
        </div>

        {/* Turn Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold tracking-widest text-text-secondary uppercase">
            STATUS:
          </div>
          {gameState.status === 'playing' ? (
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 bg-accent-bright ${isMyTurn ? 'animate-pulse-blue' : ''}`} />
              <span className="font-mono text-sm font-bold uppercase tracking-wider">
                {gameState.turn.toUpperCase()}'S TURN
              </span>
            </div>
          ) : (
            <div className="badge badge-red font-bold">GAME OVER</div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="bg-state-checkGlow border border-state-check p-3 text-sm text-state-check mb-4">
          {errorMessage}
        </div>
      )}

      {/* Draw Offer Banner */}
      {drawOfferFrom && !isSpectator && (
        <div className="bg-accent-blue/10 border border-accent-blue p-4 flex items-center justify-between gap-4 mb-4">
          <div className="text-sm font-semibold">
            {drawOfferFrom} offers a draw. Do you accept?
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleDrawResponse(false)}
              className="btn btn-secondary btn-sm"
            >
              DECLINE
            </button>
            <button
              onClick={() => handleDrawResponse(true)}
              className="btn btn-primary btn-sm"
            >
              ACCEPT
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow items-start">
        {/* Left Panel: Sidebar actions / Move history */}
        <div className="lg:col-span-3 space-y-4 flex flex-col h-full justify-between">
          <div className="flex-grow">
            <MoveHistory />
          </div>

          {!isSpectator && gameState.status === 'playing' && (
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border-dim">
              <button onClick={handleOfferDraw} className="btn btn-secondary justify-center">
                OFFER DRAW
              </button>
              <button onClick={handleResign} className="btn btn-danger justify-center">
                RESIGN
              </button>
            </div>
          )}

          {/* Review Game Button (visible after game ends) */}
          {gameState.status !== 'playing' && gameState.moveHistory.length > 0 && (
            <button
              onClick={() => setShowReview(true)}
              className="btn btn-primary w-full justify-center mt-2"
              style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}
            >
              🔍 REVIEW GAME
            </button>
          )}

          {/* Leave Button */}
          <button
            onClick={() => {
              socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { code: roomCode });
              navigate('/');
            }}
            className="btn btn-secondary w-full justify-center mt-2"
          >
            LEAVE ROOM
          </button>
        </div>

        {/* Center Panel: Board, timers, captured pieces */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-4 relative">
          {/* Board & Overlay */}
          <div className="relative w-full max-w-[480px]">
            <GameOverOverlay />
            <ChessBoardComponent />
          </div>

          {/* Info & Timers bar below board */}
          <div className="w-full max-w-[480px] grid grid-cols-2 gap-4">
            {/* White Player Panel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm truncate max-w-[120px]">
                  {whitePlayer?.nickname || 'White'}
                </div>
                <CapturedPieces color="black" /> {/* Black pieces captured by White */}
              </div>
              <PlayerTimer color="white" />
            </div>

            {/* Black Player Panel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm truncate max-w-[120px]">
                  {blackPlayer?.nickname || 'Black'}
                </div>
                <CapturedPieces color="white" /> {/* White pieces captured by Black */}
              </div>
              <PlayerTimer color="black" />
            </div>
          </div>
        </div>

        {/* Right Panel: Scrambled mappings summary */}
        <div className="lg:col-span-3 panel p-4 space-y-4">
          <h2 className="label text-[10px] tracking-widest text-text-accent">ACTIVE MAPPINGS</h2>
          <div className="space-y-2">
            <div className="panel p-3 flex justify-between items-center bg-bg-secondary text-sm">
              <span className="font-bold text-text-primary">QUEEN</span>
              <span className="text-text-dim">➔</span>
              <span className="font-mono text-accent-bright font-bold uppercase">
                {gameState.ruleMapping.queen}
              </span>
            </div>
            <div className="panel p-3 flex justify-between items-center bg-bg-secondary text-sm">
              <span className="font-bold text-text-primary">ROOK</span>
              <span className="text-text-dim">➔</span>
              <span className="font-mono text-accent-bright font-bold uppercase">
                {gameState.ruleMapping.rook}
              </span>
            </div>
            <div className="panel p-3 flex justify-between items-center bg-bg-secondary text-sm">
              <span className="font-bold text-text-primary">BISHOP</span>
              <span className="text-text-dim">➔</span>
              <span className="font-mono text-accent-bright font-bold uppercase">
                {gameState.ruleMapping.bishop}
              </span>
            </div>
            <div className="panel p-3 flex justify-between items-center bg-bg-secondary text-sm">
              <span className="font-bold text-text-primary">KNIGHT</span>
              <span className="text-text-dim">➔</span>
              <span className="font-mono text-accent-bright font-bold uppercase">
                {gameState.ruleMapping.knight}
              </span>
            </div>
          </div>

          <div className="border-t border-border-dim pt-4 text-[10px] text-text-secondary space-y-1">
            <div className="font-bold text-text-primary uppercase tracking-wide">UNCHANGED PIECES</div>
            <div>• KING (always normal movement)</div>
            <div>• PAWN (always normal movement)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
