import React, { useEffect, useState } from 'react';
import { Color } from '@chaos-chess/shared';
import { useGameStore } from '../store/gameStore';

interface PlayerTimerProps {
  color: Color;
}

export default function PlayerTimer({ color }: PlayerTimerProps) {
  const { gameState } = useGameStore();

  const currentMs = gameState?.timers[color] ?? 0;
  const isTurn = gameState?.turn === color && gameState.status === 'playing';

  // Format MS to MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isLowTime = currentMs <= 30000; // 30 seconds or less

  return (
    <div
      className={`panel px-4 py-2 font-mono text-xl font-bold tracking-wider flex items-center justify-between border-t-2 ${
        isTurn
          ? isLowTime
            ? 'border-t-state-check text-state-check bg-state-checkGlow'
            : 'border-t-accent-blue text-accent-bright bg-accent-blue/5'
          : 'border-t-border text-text-secondary'
      }`}
    >
      <span className="text-xs font-sans tracking-widest text-text-dim uppercase">
        {color.toUpperCase()} CLOCK
      </span>
      <span>{formatTime(currentMs)}</span>
    </div>
  );
}
