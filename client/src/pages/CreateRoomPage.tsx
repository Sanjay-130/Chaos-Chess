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

const TIME_OPTIONS = [
  { value: 1,  label: '1 min' },
  { value: 3,  label: '3 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
];

export default function CreateRoomPage() {
  const [nicknameInput, setNicknameInput] = useState('');
  const [colorPref, setColorPref]         = useState<ColorPref>('random');
  const [timeControl, setTimeControl]     = useState<number>(10);
  const [customMode, setCustomMode]       = useState(false);
  const [customInput, setCustomInput]     = useState('10');
  const [loading, setLoading]             = useState(false);

  const { roomCode, setNickname, resetAll } = useGameStore();
  const { errorMessage, setErrorMessage }  = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    resetAll();
  }, [resetAll]);

  useEffect(() => {
    if (roomCode) navigate(`/room/${roomCode}`);
  }, [roomCode, navigate]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) { setErrorMessage('Nickname is required'); return; }
    const finalTime = customMode ? (parseInt(customInput, 10) || 10) : timeControl;
    if (finalTime < 1 || finalTime > 180) { setErrorMessage('Time must be between 1 and 180 minutes'); return; }
    setLoading(true);
    setErrorMessage(null);
    setNickname(nicknameInput.trim());
    connectSocket();
    socket.emit(SOCKET_EVENTS.CREATE_ROOM, {
      nickname: nicknameInput.trim(),
      colorPreference: colorPref,
      timeControl: finalTime,
    });
  };

  return (
    <div className="max-w-md w-full mx-auto px-6 py-12 animate-slide-up">
      {/* Page Header */}
      <div className="mb-6">
        <div className="section-title mb-2">New Match</div>
        <h1 className="text-3xl font-black tracking-tight text-gradient">CREATE ROOM</h1>
        <p className="text-xs text-text-secondary mt-1">Host a private match and invite a friend.</p>
      </div>

      <form onSubmit={handleCreate} className="panel p-8 space-y-7">

        {/* Error */}
        {errorMessage && (
          <div
            className="flex items-center gap-3 p-3 text-sm font-semibold border"
            style={{ background: 'rgba(239,68,68,0.08)', borderColor: '#ef4444', color: '#f87171' }}
          >
            <span>⚠</span> {errorMessage}
          </div>
        )}

        {/* Nickname */}
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

        {/* Color */}
        <div className="space-y-2">
          <label className="label block">Play As</label>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_OPTIONS.map(({ value, label, piece, desc }) => {
              const sel = colorPref === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColorPref(value)}
                  disabled={loading}
                  className={`relative flex flex-col items-center gap-1.5 py-5 px-2 border cursor-pointer transition-all ${
                    sel ? 'bg-accent-blue/10 border-accent-blue' : 'bg-bg-secondary border-border'
                  }`}
                >
                  {sel && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent-bright shadow-[0_0_6px_#3b82f6]" />
                  )}
                  <span className="text-2xl leading-none" style={{ opacity: sel ? 1 : 0.35 }}>{piece}</span>
                  <span className={`text-[10px] font-bold tracking-widest ${sel ? 'text-white' : 'text-text-dim'}`}>
                    {label.toUpperCase()}
                  </span>
                  <span className={`text-[9px] tracking-wide ${sel ? 'text-text-secondary' : 'text-text-dim'}`}>
                    {desc.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Control */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="label">Time Control</label>
            <span className="text-xs font-bold text-accent-bright">
              {customMode ? (parseInt(customInput, 10) || 0) : timeControl} min
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {TIME_OPTIONS.map(({ value, label }) => {
              const sel = !customMode && timeControl === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setTimeControl(value); setCustomMode(false); }}
                  className={`flex items-center justify-center py-2 px-1 border cursor-pointer text-xs font-bold transition-all ${
                    sel ? 'bg-accent-blue/10 border-accent-blue text-white' : 'bg-transparent border-border text-text-secondary'
                  }`}
                >
                  {label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setCustomMode(true)}
              className={`flex items-center justify-center py-2 px-1 border cursor-pointer text-xs font-bold transition-all ${
                customMode ? 'bg-accent-blue/10 border-accent-blue text-white' : 'bg-transparent border-border text-text-secondary'
              }`}
            >
              CUSTOM
            </button>
          </div>
          {customMode && (
            <div className="flex items-center gap-3 mt-1">
              <input
                type="number"
                min={1} max={180}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onBlur={() => {
                  const n = parseInt(customInput, 10);
                  if (!n || n < 1) setCustomInput('1');
                  if (n > 180) setCustomInput('180');
                }}
                className="input text-center font-bold text-lg"
                style={{ width: 90, padding: '8px' }}
                autoFocus
                placeholder="min"
              />
              <span className="text-xs text-text-secondary">minutes &nbsp;(1 – 180)</span>
            </div>
          )}
        </div>

        {/* Actions */}
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
            {loading ? 'CREATING...' : 'CREATE ROOM →'}
          </button>
        </div>
      </form>
    </div>
  );
}
