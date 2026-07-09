import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { socket, connectSocket } from '../socket/socket';
import { SOCKET_EVENTS } from '@chaos-chess/shared';

export default function CreateRoomPage() {
  const [nicknameInput, setNicknameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { roomCode, setNickname } = useGameStore();
  const { errorMessage, setErrorMessage } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    // If roomCode updates, redirect to the room
    if (roomCode) {
      navigate(`/room/${roomCode}`);
    }
  }, [roomCode, navigate]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) {
      setErrorMessage('Nickname is required');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setNickname(nicknameInput.trim());

    // Connect socket
    connectSocket();

    // Trigger room creation
    socket.emit(SOCKET_EVENTS.CREATE_ROOM, { nickname: nicknameInput.trim() });
  };

  return (
    <div className="max-w-md w-full mx-auto px-6 py-12 animate-slide-up">
      <form onSubmit={handleCreate} className="panel p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gradient">CREATE ROOM</h1>
          <p className="text-xs text-text-secondary mt-1">Host a private match to play with a friend.</p>
        </div>

        {errorMessage && (
          <div className="bg-state-checkGlow border border-state-check p-3 text-sm text-state-check">
            {errorMessage}
          </div>
        )}

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
            disabled={loading || !nicknameInput.trim()}
          >
            {loading ? 'CREATING...' : 'CREATE'}
          </button>
        </div>
      </form>
    </div>
  );
}
