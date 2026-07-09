import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { socket } from '../socket/socket';
import { SOCKET_EVENTS } from '@chaos-chess/shared';
import RuleScreen from '../components/RuleScreen';

export default function WaitingRoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const {
    roomState,
    playerColor,
    isSpectator,
    countdown,
    ruleMapping,
    nickname,
  } = useGameStore();

  const { errorMessage, setErrorMessage } = useUIStore();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reconnection guard: if user lands here directly or page refreshed, let them enter nickname first or attempt reconnection.
  useEffect(() => {
    if (!roomState && code) {
      if (nickname) {
        // Automatically reconnect with nickname if stored in zustand
        socket.emit(SOCKET_EVENTS.RECONNECT, { code, nickname });
      } else {
        // Redirect to Join page to supply nickname first
        navigate(`/join/${code}`);
      }
    }
  }, [roomState, code, nickname, navigate]);

  // Navigate to game screen when phase shifts to playing or gameover
  useEffect(() => {
    if (roomState && (roomState.phase === 'playing' || roomState.phase === 'gameover')) {
      navigate(`/game/${code}`);
    }
  }, [roomState, code, navigate]);

  if (!roomState) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="conn-dot connecting" />
        <div className="text-text-secondary font-semibold">CONNECTING TO ROOM...</div>
      </div>
    );
  }

  const players = roomState.players || [];
  const spectators = roomState.spectators || [];
  const currentPlayer = players.find((p) => p.socketId === socket.id);
  const isReady = currentPlayer?.isReady || false;

  const copyCode = () => {
    navigator.clipboard.writeText(roomState.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${roomState.code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReady = () => {
    socket.emit(SOCKET_EVENTS.PLAYER_READY, { code: roomState.code });
  };

  return (
    <div className="max-w-xl w-full mx-auto px-6 py-8 relative">
      {/* Rule Screen Countdown Overlay */}
      {roomState.phase === 'countdown' && countdown !== null && ruleMapping && (
        <RuleScreen />
      )}

      <div className="panel p-8 space-y-6">
        {/* Header */}
        <div className="border-b border-border-dim pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black tracking-wide">WAITING ROOM</h1>
            <p className="text-xs text-text-secondary">Waiting for players to connect and ready up.</p>
          </div>
          {isSpectator && <span className="badge badge-blue">SPECTATING</span>}
        </div>

        {errorMessage && (
          <div className="bg-state-checkGlow border border-state-check p-3 text-sm text-state-check">
            {errorMessage}
          </div>
        )}

        {/* Room Code Panel */}
        <div className="grid grid-cols-2 gap-4">
          <div className="panel p-4 flex flex-col justify-between h-24">
            <span className="label block text-[10px]">ROOM CODE</span>
            <div className="text-2xl font-mono font-bold tracking-wider">{roomState.code}</div>
            <button
              onClick={copyCode}
              className="btn btn-secondary btn-sm justify-center w-full font-bold tracking-wide mt-2"
            >
              {copiedCode ? 'COPIED' : 'COPY CODE'}
            </button>
          </div>

          <div className="panel p-4 flex flex-col justify-between h-24">
            <span className="label block text-[10px]">INVITE LINK</span>
            <div className="text-[10px] text-text-secondary truncate font-mono">
              {window.location.origin}/join/{roomState.code}
            </div>
            <button
              onClick={copyInviteLink}
              className="btn btn-secondary btn-sm justify-center w-full font-bold tracking-wide mt-2"
            >
              {copiedLink ? 'LINK COPIED' : 'COPY LINK'}
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-3">
          <h2 className="label">PLAYERS ({players.length}/2)</h2>
          <div className="space-y-2">
            {players.length === 0 ? (
              <div className="text-sm text-text-dim">No players connected.</div>
            ) : (
              players.map((p) => (
                <div
                  key={p.socketId}
                  className={`panel p-4 flex items-center justify-between border-l-2 ${
                    p.isReady ? 'border-l-state-success' : 'border-l-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`conn-dot ${p.isConnected ? 'connected' : 'disconnected'}`}
                    />
                    <div className="font-bold">{p.nickname}</div>
                    <div className="text-xs text-text-secondary font-semibold">
                      ({p.color.toUpperCase()})
                    </div>
                  </div>
                  <div>
                    {p.isReady ? (
                      <span className="badge badge-green font-bold">READY</span>
                    ) : (
                      <span className="badge badge-gray font-bold">WAITING</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Spectators List */}
        {spectators.length > 0 && (
          <div className="space-y-3">
            <h2 className="label">SPECTATORS ({spectators.length})</h2>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-2">
              {spectators.map((s) => (
                <div key={s.socketId} className="flex items-center gap-2 text-sm">
                  <span className="conn-dot connected" />
                  <span className="text-text-secondary">{s.nickname}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isSpectator && (
          <div className="pt-4">
            <button
              onClick={handleReady}
              disabled={isReady || players.length < 2}
              className={`w-full btn btn-lg justify-center font-bold tracking-wider ${
                isReady ? 'btn-secondary opacity-50' : 'btn-primary'
              }`}
            >
              {isReady ? 'READY - WAITING FOR OPPONENT' : 'READY UP'}
            </button>
          </div>
        )}

        {isSpectator && (
          <div className="text-center text-xs text-text-secondary italic">
            Waiting for players to ready up.
          </div>
        )}
      </div>
    </div>
  );
}
