import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { socket } from '../socket/socket';
import { SOCKET_EVENTS } from '@chaos-chess/shared';

export default function GameOverOverlay() {
  const { gameState, roomState, roomCode, isSpectator } = useGameStore();
  const { rematchDeclined, setRematchDeclined } = useUIStore();
  const [dismissed, setDismissed] = useState(false);

  if (!gameState || !roomState || gameState.status === 'playing' || dismissed) return null;

  const votes        = roomState.playAgainVotes || [];
  const mySocketId   = socket.id ?? '';
  const iHaveVoted   = votes.includes(mySocketId);
  const oppHasVoted  = votes.some((id) => id !== mySocketId);

  const handleRequestRematch = () => {
    if (roomCode) {
      socket.emit(SOCKET_EVENTS.PLAY_AGAIN, { code: roomCode });
    }
  };

  const handleDeclineRematch = () => {
    if (roomCode) {
      socket.emit(SOCKET_EVENTS.DECLINE_REMATCH, { code: roomCode });
      setRematchDeclined(false);
    }
  };

  const getWinnerName = () => {
    if (!gameState.winner) return '';
    const player = roomState.players.find((p) => p.color === gameState.winner);
    return player ? player.nickname : gameState.winner.toUpperCase();
  };

  let title = 'GAME OVER';
  let desc  = '';

  switch (gameState.status) {
    case 'checkmate':
      title = 'CHECKMATE';
      desc  = gameState.winner ? `${getWinnerName()} wins by checkmate.` : '';
      break;
    case 'stalemate':
      title = 'STALEMATE';
      desc  = 'Draw by stalemate.';
      break;
    case 'draw':
      title = 'DRAW';
      desc  = 'Draw by agreement or repetition.';
      break;
    case 'resigned':
      title = 'RESIGNATION';
      desc  = gameState.winner ? `${getWinnerName()} wins by resignation.` : '';
      break;
    case 'timeout':
      title = 'TIMEOUT';
      desc  = gameState.winner ? `${getWinnerName()} wins on time.` : '';
      break;
    case 'aborted':
      title = 'ABORTED';
      desc  = 'Match aborted.';
      break;
    case 'abandoned':
      title = 'ABANDONED';
      desc  = gameState.winner ? `${getWinnerName()} wins. Opponent left the room.` : 'Match abandoned.';
      break;
  }

  // ── Rematch section logic ─────────────────────────────────────────────────
  const renderRematchSection = () => {
    if (isSpectator) {
      return (
        <div className="text-xs text-text-dim italic text-center">
          Waiting for players to decide on a rematch...
        </div>
      );
    }

    // Opponent declined our request
    if (rematchDeclined) {
      return (
        <div className="space-y-3">
          <div
            className="flex items-center gap-2 p-3 border text-sm font-semibold"
            style={{ borderColor: '#ef4444', background: 'rgba(239,68,68,0.08)', color: '#f87171' }}
          >
            <span>✗</span>
            <span>Rematch was declined.</span>
          </div>
          <button
            onClick={handleRequestRematch}
            className="btn btn-secondary w-full justify-center text-xs"
          >
            REQUEST AGAIN
          </button>
        </div>
      );
    }

    // Opponent has requested a rematch — show Accept / Decline
    if (oppHasVoted && !iHaveVoted) {
      const opp = roomState.players.find((p) => votes.includes(p.socketId));
      const oppName = opp?.nickname ?? 'Opponent';
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 border text-sm font-semibold border-accent-blue/40 bg-accent-blue/10 text-accent-bright">
            <span>🔄</span>
            <span>{oppName} wants a rematch!</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDeclineRematch}
              className="btn btn-secondary justify-center font-bold"
            >
              DECLINE
            </button>
            <button
              onClick={handleRequestRematch}
              className="btn btn-primary justify-center font-bold"
            >
              ACCEPT ✓
            </button>
          </div>
        </div>
      );
    }

    // I have voted, waiting for opponent
    if (iHaveVoted) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 border text-sm font-semibold border-border bg-white/5 text-text-secondary">
            <span className="conn-dot connecting" style={{ width: 8, height: 8 }} />
            <span>Rematch requested — waiting for opponent...</span>
          </div>
          <button
            onClick={handleDeclineRematch}
            className="btn btn-secondary w-full justify-center text-xs"
          >
            CANCEL REQUEST
          </button>
        </div>
      );
    }

    // Default — nobody has voted yet
    return (
      <button
        onClick={handleRequestRematch}
        className="btn btn-primary w-full justify-center font-bold tracking-wider"
      >
        🔄 REQUEST REMATCH
      </button>
    );
  };

  return (
    <div className="absolute inset-0 bg-bg-primary/90 flex flex-col items-center justify-center z-[110] animate-fade-in p-4 text-center">
      <div className="max-w-xs w-full panel p-6 border-2 border-accent-blue space-y-4 relative">

        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          title="Dismiss — use Review Game to analyse the match"
          className="absolute top-2.5 right-2.5 w-[26px] h-[26px] flex items-center justify-center text-sm border border-border text-text-secondary hover:border-accent-blue hover:text-white transition-all cursor-pointer bg-transparent"
        >
          ✕
        </button>

        {/* Result */}
        <div>
          <span className="badge badge-red font-bold mb-2">MATCH RESOLVED</span>
          <h2 className="text-2xl font-black tracking-wider text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary mt-1">{desc}</p>
        </div>

        <div className="border-t border-border-dim pt-4">
          {renderRematchSection()}
        </div>

        <p className="text-[10px] text-text-dim">
          Press ✕ to dismiss · use 🔍 Review Game in the sidebar
        </p>
      </div>
    </div>
  );
}
