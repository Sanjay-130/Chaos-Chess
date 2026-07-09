import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { socket, connectSocket } from '../socket/socket';
import { SOCKET_EVENTS } from '@chaos-chess/shared';

export default function JoinRoomPage() {
  const { code } = useParams<{ code?: string }>();
  const [nicknameInput, setNicknameInput] = useState('');
  const [codeInput, setCodeInput] = useState(code || '');
  const [loading, setLoading] = useState(false);
  const { roomCode, setNickname } = useGameStore();
  const { errorMessage, setErrorMessage } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      setCodeInput(code.toUpperCase());
    }
  }, [code]);

  useEffect(() => {
    if (roomCode) {
      navigate(`/room/${roomCode}`);
    }
  }, [roomCode, navigate]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) {
      setErrorMessage('Nickname is required');
      return;
    }
    if (!codeInput.trim()) {
      setErrorMessage('Room code is required');
      return;
    }

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
      <form onSubmit={handleJoin} className="panel p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gradient">JOIN ROOM</h1>
          <p className="text-xs text-text-secondary mt-1">Join an existing match as a player or spectator.</p>
        </div>

        {errorMessage && (
          <div className="bg-state-checkGlow border border-state-check p-3 text-sm text-state-check">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="label block">NICKNAME</label>
            <input
              type="text"
              className="input font-semibold"
              placeholder="Enter your nickname"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              disabled={loading}
              maxLength={15}
            />
          </div>

          <div className="space-y-2">
            <label className="label block">ROOM CODE</label>
            <input
              type="text"
              className="input font-mono font-bold tracking-widest text-center"
              placeholder="6-LETTER CODE"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              disabled={loading || !!code}
              maxLength={6}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            className="btn btn-secondary flex-1"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            BACK
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1 justify-center"
            disabled={loading || !nicknameInput.trim() || !codeInput.trim()}
          >
            {loading ? 'JOINING...' : 'JOIN'}
          </button>
        </div>
      </form>
    </div>
  );
}
