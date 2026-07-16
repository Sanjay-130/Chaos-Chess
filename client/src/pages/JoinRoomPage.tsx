import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { socket, connectSocket } from '../socket/socket';
import { SOCKET_EVENTS } from '@chaos-chess/shared';

export default function JoinRoomPage() {
  const { code }                           = useParams<{ code?: string }>();
  const [nicknameInput, setNicknameInput]  = useState('');
  const [codeInput, setCodeInput]          = useState(code || '');
  const [loading, setLoading]              = useState(false);

  const { roomCode, setNickname }          = useGameStore();
  const { errorMessage, setErrorMessage }  = useUIStore();
  const navigate = useNavigate();

  useEffect(() => { if (code) setCodeInput(code.toUpperCase()); }, [code]);
  useEffect(() => { if (roomCode) navigate(`/room/${roomCode}`); }, [roomCode, navigate]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) { setErrorMessage('Nickname is required'); return; }
    if (!codeInput.trim())     { setErrorMessage('Room code is required'); return; }
    setLoading(true);
    setErrorMessage(null);
    setNickname(nicknameInput.trim());
    connectSocket();
    socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
      code: codeInput.trim().toUpperCase(),
      nickname: nicknameInput.trim(),
    });
  };

  return (
    <div className="max-w-md w-full mx-auto px-6 py-12 animate-slide-up">
      {/* Page Header */}
      <div className="mb-6">
        <div className="section-title mb-2">Join Match</div>
        <h1 className="text-3xl font-black tracking-tight text-gradient">JOIN ROOM</h1>
        <p className="text-xs text-text-secondary mt-1">Enter the room code to join as a player or spectator.</p>
      </div>

      <form onSubmit={handleJoin} className="panel p-8 space-y-6">

        {errorMessage && (
          <div
            className="flex items-center gap-3 p-3 text-sm font-semibold border"
            style={{ background: 'rgba(239,68,68,0.08)', borderColor: '#ef4444', color: '#f87171' }}
          >
            <span>⚠</span> {errorMessage}
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="label block">Nickname</label>
            <input
              type="text"
              className="input font-semibold"
              placeholder="Enter your callsign..."
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              disabled={loading}
              maxLength={15}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="label block">Room Code</label>
            <input
              type="text"
              className="input font-mono font-black tracking-[0.4em] text-center text-lg text-accent-bright"
              placeholder="XXXXXX"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              disabled={loading || !!code}
              maxLength={6}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            className="btn btn-secondary flex-none"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            ← BACK
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1 justify-center"
            disabled={loading}
          >
            {loading ? 'JOINING...' : 'JOIN ROOM →'}
          </button>
        </div>
      </form>
    </div>
  );
}
