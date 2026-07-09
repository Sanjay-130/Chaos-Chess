import React from 'react';
import { useGameStore } from '../store/gameStore';

export default function ConnectionStatus() {
  const { isConnected, roomState } = useGameStore();

  if (isConnected) return null;

  return (
    <div className="bg-state-check text-white text-xs font-bold text-center py-2 flex items-center justify-center gap-2 z-50">
      <span className="conn-dot disconnected animate-pulse" />
      <span>DISCONNECTED FROM SERVER. ATTEMPTING TO RECONNECT...</span>
    </div>
  );
}
