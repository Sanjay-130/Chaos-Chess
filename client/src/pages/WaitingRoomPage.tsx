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
    roomCode,
    resetAll,
  } = useGameStore();

  const { errorMessage, setErrorMessage } = useUIStore();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reconnection guard — only when still bound to this room (not after leaving)
  useEffect(() => {
    if (!roomState && code && roomCode === code) {
      if (nickname) {
        socket.emit(SOCKET_EVENTS.RECONNECT, { code, nickname });
      } else {
        navigate(`/join/${code}`);
      }
    }
  }, [roomState, roomCode, code, nickname, navigate]);

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
              <span className="badge badge-blue">
                {roomState.timeControl} MIN
              </span>
            )}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 border text-xs font-bold tracking-wide ${
                bothPresent
                  ? 'bg-accent-blue/10 border-accent-blue/30 text-accent-bright'
                  : 'bg-white/5 border-border text-text-secondary'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse ${
                  bothPresent ? 'bg-accent-bright shadow-[0_0_5px_#3b82f6]' : 'bg-text-secondary'
                }`}
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
            <div className="flex flex-col gap-3 p-4 border bg-bg-secondary border-border">
              <div>
                <div className="label text-[9px] mb-1">ROOM CODE</div>
                <div className="text-2xl font-mono font-black tracking-[0.15em] text-gradient">
                  {roomState.code}
                </div>
              </div>
              <button
                onClick={copyCode}
                className={`btn btn-secondary btn-sm w-full justify-center font-bold ${
                  copiedCode ? 'border-accent-blue text-accent-bright' : ''
                }`}
              >
                {copiedCode ? '✓ COPIED' : 'COPY CODE'}
              </button>
            </div>

            {/* Invite Link */}
            <div className="flex flex-col gap-3 p-4 border bg-bg-secondary border-border">
              <div>
                <div className="label text-[9px] mb-1">INVITE LINK</div>
                <div className="text-[10px] text-text-secondary font-mono truncate leading-relaxed">
                  {window.location.origin}/join/
                  <span className="text-text-primary font-bold">{roomState.code}</span>
                </div>
              </div>
              <button
                onClick={copyInviteLink}
                className={`btn btn-secondary btn-sm w-full justify-center font-bold ${
                  copiedLink ? 'border-accent-blue text-accent-bright' : ''
                }`}
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
                    className="flex items-center gap-4 p-4 border border-dashed border-border bg-transparent"
                  >
                    <div className="w-8 h-8 rounded-full border border-dashed border-border flex items-center justify-center">
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
                  className={`flex items-center justify-between p-4 border-l-2 ${
                    player.isReady
                      ? 'bg-accent-blue/5 border-l-accent-blue border-accent-blue/20'
                      : isMe
                      ? 'bg-accent-blue/5 border-l-accent-bright border-accent-blue/20'
                      : 'bg-bg-secondary border-l-border border-border'
                  }`}
                >
                  {/* Left: avatar + name */}
                  <div className="flex items-center gap-3">
                    {/* Color piece avatar */}
                    <div
                      className={`w-9 h-9 flex items-center justify-center text-xl border ${
                        player.color === 'white'
                          ? 'bg-white/5 border-white/15'
                          : 'bg-accent-blue/10 border-accent-blue/25'
                      }`}
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
                      <div className={`text-[10px] font-semibold tracking-wider mt-0.5 ${
                        player.color === 'white' ? 'text-text-secondary' : 'text-accent-light'
                      }`}>
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
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-border bg-bg-secondary"
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
                const codeToLeave = roomState?.code || code;
                resetAll();
                navigate('/');
                if (codeToLeave) {
                  socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { code: codeToLeave });
                }
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
