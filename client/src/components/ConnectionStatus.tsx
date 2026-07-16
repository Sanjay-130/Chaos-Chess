import React from 'react';
import { useGameStore } from '../store/gameStore';

export default function ConnectionStatus() {
  const isConnected = useGameStore((s) => s.isConnected);

  if (isConnected) return null;

  return (
    <div
      className="flex items-center justify-center gap-3 text-xs font-bold py-2 z-50"
      style={{
        background: 'rgba(239,68,68,0.12)',
        borderBottom: '1px solid rgba(239,68,68,0.4)',
        color: '#f87171',
        letterSpacing: '0.1em',
      }}
    >
      <span className="conn-dot disconnected" />
      DISCONNECTED — ATTEMPTING TO RECONNECT...
    </div>
  );
}
