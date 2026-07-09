import React from 'react';
import { useGameStore } from '../store/gameStore';
import { socket } from '../socket/socket';
import { SOCKET_EVENTS } from '@chaos-chess/shared';

export default function GameOverOverlay() {
  const { gameState, roomState, roomCode, isSpectator } = useGameStore();

  if (!gameState || !roomState || gameState.status === 'playing') return null;

  const votes = roomState.playAgainVotes || [];
  const hasVoted = socket.id ? votes.includes(socket.id) : false;

  const handlePlayAgain = () => {
    if (roomCode) {
      socket.emit(SOCKET_EVENTS.PLAY_AGAIN, { code: roomCode });
    }
  };

  const getWinnerName = () => {
    if (!gameState.winner) return '';
    const player = roomState.players.find((p) => p.color === gameState.winner);
    return player ? player.nickname : gameState.winner.toUpperCase();
  };

  let title = 'GAME OVER';
  let desc = '';

  switch (gameState.status) {
    case 'checkmate':
      title = 'CHECKMATE';
      desc = gameState.winner
        ? `${getWinnerName()} wins by checkmate.`
        : '';
      break;
    case 'stalemate':
      title = 'STALEMATE';
      desc = 'Draw by stalemate.';
      break;
    case 'draw':
      title = 'DRAW';
      desc = 'Draw by agreement or 50-move rule.';
      break;
    case 'resigned':
      title = 'RESIGNATION';
      desc = gameState.winner
        ? `${getWinnerName()} wins by resignation.`
        : '';
      break;
    case 'timeout':
      title = 'TIMEOUT';
      desc = gameState.winner
        ? `${getWinnerName()} wins on time.`
        : '';
      break;
    case 'aborted':
      title = 'ABORTED';
      desc = 'Match aborted.';
      break;
  }

  return (
    <div className="absolute inset-0 bg-bg-primary/90 flex flex-col items-center justify-center z-[110] animate-fade-in p-4 text-center">
      <div className="max-w-xs w-full panel p-6 border-2 border-accent-blue space-y-6">
        <div>
          <span className="badge badge-red font-bold mb-2">MATCH RESOLVED</span>
          <h2 className="text-2xl font-black tracking-wider text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary mt-1">{desc}</p>
        </div>

        <div className="border-t border-border-dim pt-4">
          {isSpectator ? (
            <div className="text-xs text-text-dim italic">
              Waiting for players to vote play again...
            </div>
          ) : hasVoted ? (
            <div className="space-y-2">
              <div className="conn-dot connecting" />
              <div className="text-xs text-text-secondary font-semibold">
                WAITING FOR OPPONENT...
              </div>
            </div>
          ) : (
            <button
              onClick={handlePlayAgain}
              className="btn btn-primary w-full justify-center font-bold tracking-wider"
            >
              PLAY AGAIN
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
