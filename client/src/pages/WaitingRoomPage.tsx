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
    resetAll,
  } = useGameStore();

  const { errorMessage, setErrorMessage } = useUIStore();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reconnection guard
  useEffect(() => {
    if (!roomState && code) {
      if (nickname) {
        socket.emit(SOCKET_EVENTS.RECONNECT, { code, nickname });
      } else {
        navigate(`/join/${code}`);
      }
    }
  }, [roomState, code, nickname, navigate]);

  // Navigate when game starts
  useEffect(() => {
    if (roomState && (roomState.phase === 'playing' || roomState.phase === 'gameover')) {
      navigate(`/game/${code}`);
    }
  }, [roomState, code, navigate]);

  if (!roomState) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <span className="conn-dot connecting" />
        <span className="text-text-secondary text-xs font-bold tracking-widest">CONNECTING TO ROOM...</span>
      </div>
    );
  }

  const players = roomState.players || [];
  const spectators = roomState.spectators || [];
  const currentPlayer = players.find((p) => p.socketId === socket.id);
  const isReady = currentPlayer?.isReady || false;
  const bothPresent = players.length === 2;

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

  // Color display helpers
  const colorIcon = (c: string) => (c === 'white' ? '♔' : '♚');
  const colorLabel = (c: string) => c.toUpperCase();

  return (
    <div className="max-w-lg w-full mx-auto px-6 py-8 relative">
      {/* Countdown overlay */}
      {roomState.phase === 'countdown' && countdown !== null && ruleMapping && <RuleScreen />}

      <div className="panel p-0 overflow-hidden">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="px-7 py-5 border-b border-border-dim flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black tracking-widest">WAITING ROOM</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              {bothPresent ? 'Both players connected — ready up to start!' : 'Waiting for opponent to join...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSpectator && <span className="badge badge-blue">SPECTATING</span>}
            {roomState.timeControl && (
              <span className="badge border px-2 py-1 text-[10px] font-bold" style={{ borderColor: '#6366f1', color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)' }}>
                {roomState.timeControl} MIN
              </span>
            )}
            {/* Live player count pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 border text-xs font-bold tracking-wide"
              style={{
                background: bothPresent ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
                borderColor: bothPresent ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)',
                color: bothPresent ? '#4ade80' : '#fbbf24',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{
                  background: bothPresent ? '#22c55e' : '#f59e0b',
                  boxShadow: `0 0 5px ${bothPresent ? '#22c55e' : '#f59e0b'}`,
                  animation: 'pulse 1.5s ease infinite',
                }}
              />
              {players.length}/2
            </div>
          </div>
        </div>

        {/* ── Error Banner ────────────────────────────────────────────────────── */}
        {errorMessage && (
          <div className="mx-7 mt-5 bg-state-checkGlow border border-state-check p-3 text-sm text-state-check">
            {errorMessage}
          </div>
        )}

        {/* ── Invite Section ──────────────────────────────────────────────────── */}
        <div className="px-7 pt-6 pb-5 border-b border-border-dim space-y-3">
          <h2 className="label">INVITE FRIEND</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Room Code */}
            <div
              className="flex flex-col gap-3 p-4 border"
              style={{ background: '#080b12', borderColor: '#1e2d3d' }}
            >
              <div>
                <div className="label text-[9px] mb-1">ROOM CODE</div>
                <div className="text-2xl font-mono font-black tracking-[0.15em] text-gradient">
                  {roomState.code}
                </div>
              </div>
              <button
                onClick={copyCode}
                className="btn btn-secondary btn-sm w-full justify-center font-bold"
                style={copiedCode ? { borderColor: '#22c55e', color: '#4ade80' } : {}}
              >
                {copiedCode ? '✓ COPIED' : 'COPY CODE'}
              </button>
            </div>

            {/* Invite Link */}
            <div
              className="flex flex-col gap-3 p-4 border"
              style={{ background: '#080b12', borderColor: '#1e2d3d' }}
            >
              <div>
                <div className="label text-[9px] mb-1">INVITE LINK</div>
                <div className="text-[10px] text-text-secondary font-mono truncate leading-relaxed">
                  {window.location.origin}/join/
                  <span className="text-text-primary font-bold">{roomState.code}</span>
                </div>
              </div>
              <button
                onClick={copyInviteLink}
                className="btn btn-secondary btn-sm w-full justify-center font-bold"
                style={copiedLink ? { borderColor: '#22c55e', color: '#4ade80' } : {}}
              >
                {copiedLink ? '✓ COPIED' : 'COPY LINK'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Players Section ──────────────────────────────────────────────────── */}
        <div className="px-7 pt-5 pb-5 space-y-3">
          <h2 className="label">PLAYERS</h2>
          <div className="space-y-2">
            {/* Slots: always show 2 */}
            {[0, 1].map((slot) => {
              const player = players[slot];
              const isMe = player?.socketId === socket.id;

              if (!player) {
                // Empty slot
                return (
                  <div
                    key={slot}
                    className="flex items-center gap-4 p-4 border border-dashed"
                    style={{ borderColor: '#1e2d3d', background: 'transparent' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full border border-dashed flex items-center justify-center"
                      style={{ borderColor: '#1e2d3d' }}
                    >
                      <span className="text-text-dim text-xs">?</span>
                    </div>
                    <span className="text-xs text-text-dim tracking-widest font-semibold">
                      WAITING FOR PLAYER...
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={player.socketId}
                  className="flex items-center justify-between p-4 border-l-2"
                  style={{
                    background: player.isReady
                      ? 'rgba(34,197,94,0.04)'
                      : isMe
                      ? 'rgba(37,99,235,0.04)'
                      : '#080b12',
                    borderLeft: `2px solid ${
                      player.isReady ? '#22c55e' : isMe ? '#2563eb' : '#1e2d3d'
                    }`,
                    border: `1px solid ${player.isReady ? 'rgba(34,197,94,0.2)' : isMe ? 'rgba(37,99,235,0.2)' : '#1e2d3d'}`,
                    borderLeftWidth: '2px',
                    borderLeftColor: player.isReady ? '#22c55e' : isMe ? '#2563eb' : '#1e2d3d',
                  }}
                >
                  {/* Left: avatar + name */}
                  <div className="flex items-center gap-3">
                    {/* Color piece avatar */}
                    <div
                      className="w-9 h-9 flex items-center justify-center text-xl border"
                      style={{
                        background:
                          player.color === 'white'
                            ? 'rgba(240,246,255,0.06)'
                            : 'rgba(37,99,235,0.08)',
                        borderColor:
                          player.color === 'white'
                            ? 'rgba(240,246,255,0.15)'
                            : 'rgba(37,99,235,0.25)',
                      }}
                    >
                      {colorIcon(player.color)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`conn-dot ${player.isConnected ? 'connected' : 'disconnected'}`} />
                        <span className="font-bold text-sm">{player.nickname}</span>
                        {isMe && (
                          <span className="text-[9px] font-bold tracking-widest text-text-dim border border-border-dim px-1.5 py-0.5">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-semibold tracking-wider mt-0.5"
                        style={{ color: player.color === 'white' ? '#94a3b8' : '#60a5fa' }}>
                        {colorLabel(player.color)} PIECES
                      </div>
                    </div>
                  </div>

                  {/* Right: status badge */}
                  {player.isReady ? (
                    <span className="badge badge-green">READY</span>
                  ) : (
                    <span className="badge badge-gray">WAITING</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Spectators */}
          {spectators.length > 0 && (
            <div className="pt-2 space-y-2">
              <h2 className="label">SPECTATORS ({spectators.length})</h2>
              <div className="flex flex-wrap gap-2">
                {spectators.map((s) => (
                  <div
                    key={s.socketId}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs border"
                    style={{ borderColor: '#1e2d3d', background: '#080b12' }}
                  >
                    <span className="conn-dot connected" />
                    <span className="text-text-secondary font-semibold">{s.nickname}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Action ──────────────────────────────────────────────────────────── */}
        {!isSpectator && (
          <div className="px-7 pb-7">
            <button
              onClick={handleReady}
              disabled={isReady || !bothPresent}
              className={`w-full btn btn-lg justify-center font-black tracking-widest ${
                isReady ? 'btn-secondary' : 'btn-primary'
              }`}
              style={
                isReady
                  ? { opacity: 0.5 }
                  : !bothPresent
                  ? { opacity: 0.35 }
                  : {}
              }
            >
              {isReady
                ? '✓ READY — WAITING FOR OPPONENT'
                : !bothPresent
                ? 'WAITING FOR OPPONENT...'
                : 'READY UP'}
            </button>
            {!bothPresent && (
              <p className="text-center text-[10px] text-text-dim mt-2 tracking-wide">
                Share the room code above to invite a friend
              </p>
            )}
            <button
              onClick={() => {
                socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { code: roomState?.code || code });
                resetAll();
                navigate('/');
              }}
              className="w-full btn btn-secondary btn-lg justify-center mt-3 font-bold text-xs"
            >
              LEAVE ROOM
            </button>
          </div>
        )}

        {isSpectator && (
          <div className="px-7 pb-7 text-center text-xs text-text-secondary italic">
            Spectating — waiting for players to ready up
          </div>
        )}
      </div>
    </div>
  );
}
