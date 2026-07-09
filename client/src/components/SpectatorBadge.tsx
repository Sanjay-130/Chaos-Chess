import React from 'react';

export default function SpectatorBadge() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-bright text-[10px] font-bold tracking-wider uppercase">
      <span className="w-1.5 h-1.5 bg-accent-bright animate-pulse" />
      SPECTATOR MODE
    </div>
  );
}
