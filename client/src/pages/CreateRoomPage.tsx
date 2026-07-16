import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { socket, connectSocket } from '../socket/socket';
import { SOCKET_EVENTS } from '@chaos-chess/shared';

type ColorPref = 'white' | 'random' | 'black';

const COLOR_OPTIONS: { value: ColorPref; label: string; piece: string; desc: string }[] = [
  { value: 'white', label: 'White', piece: '♔', desc: 'Move first' },
  { value: 'random', label: 'Random', piece: '⚄', desc: 'Surprise me' },
  { value: 'black', label: 'Black', piece: '♚', desc: 'Move second' },
];

export default function CreateRoomPage() {
  const [nicknameInput, setNicknameInput] = useState('');
  const [colorPref, setColorPref] = useState<ColorPref>('random');
  const [loading, setLoading] = useState(false);
  const { roomCode, setNickname } = useGameStore();
  const { errorMessage, setErrorMessage } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
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
    connectSocket();
    socket.emit(SOCKET_EVENTS.CREATE_ROOM, {
      nickname: nicknameInput.trim(),
      colorPreference: colorPref,
    });
  };

  return (
    <div className="max-w-md w-full mx-auto px-6 py-12 animate-slide-up">
      <form onSubmit={handleCreate} className="panel p-8 space-y-7">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gradient">CREATE ROOM</h1>
          <p className="text-xs text-text-secondary mt-1">Host a private match and invite a friend.</p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="bg-state-checkGlow border border-state-check p-3 text-sm text-state-check">
            {errorMessage}
          </div>
        )}

        {/* Nickname */}
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
            autoFocus
          />
        </div>

        {/* Color Preference */}
        <div className="space-y-2">
          <label className="label block">PLAY AS</label>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_OPTIONS.map(({ value, label, piece, desc }) => {
              const isSelected = colorPref === value;
              const isWhite = value === 'white';
              const isBlack = value === 'black';

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColorPref(value)}
                  disabled={loading}
                  style={{
                    background: isSelected
                      ? isWhite
                        ? 'rgba(240,246,255,0.08)'
                        : isBlack
                        ? 'rgba(37,99,235,0.12)'
                        : 'rgba(99,102,241,0.12)'
                      : 'transparent',
                    borderColor: isSelected
                      ? isWhite
                        ? 'rgba(240,246,255,0.4)'
                        : isBlack
                        ? '#2563eb'
                        : '#6366f1'
                      : '#1e2d3d',
                    transition: 'all 0.15s ease',
                  }}
                  className="relative flex flex-col items-center gap-1.5 py-4 px-2 border cursor-pointer"
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <span
                      className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                      style={{
                        background: isWhite ? '#f0f6ff' : isBlack ? '#60a5fa' : '#818cf8',
                        boxShadow: `0 0 6px ${isWhite ? '#f0f6ff' : isBlack ? '#60a5fa' : '#818cf8'}`,
                      }}
                    />
                  )}
                  <span
                    className="text-2xl leading-none"
                    style={{
                      filter: isSelected ? 'none' : 'opacity(0.4)',
                      color:
                        value === 'white'
                          ? '#f0f6ff'
                          : value === 'black'
                          ? '#60a5fa'
                          : '#818cf8',
                    }}
                  >
                    {piece}
                  </span>
                  <span
                    className="text-[11px] font-bold tracking-wide"
                    style={{ color: isSelected ? '#f0f6ff' : '#3d5166' }}
                  >
                    {label.toUpperCase()}
                  </span>
                  <span
                    className="text-[9px] tracking-wide"
                    style={{ color: isSelected ? '#7c8fa6' : '#1e2d3d' }}
                  >
                    {desc.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
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
            {loading ? 'CREATING...' : 'CREATE ROOM'}
          </button>
        </div>
      </form>
    </div>
  );
}
