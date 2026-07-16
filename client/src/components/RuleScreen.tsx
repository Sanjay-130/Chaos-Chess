import React from 'react';
import { useGameStore } from '../store/gameStore';

export default function RuleScreen() {
  const { ruleMapping, countdown } = useGameStore();

  if (!ruleMapping || countdown === null) return null;

  const mappings = [
    { name: 'Queen',  icon: '♛', mapsTo: ruleMapping.queen  },
    { name: 'Rook',   icon: '♜', mapsTo: ruleMapping.rook   },
    { name: 'Bishop', icon: '♝', mapsTo: ruleMapping.bishop },
    { name: 'Knight', icon: '♞', mapsTo: ruleMapping.knight },
  ];

  const pieceIcon: Record<string, string> = {
    queen: '♛', rook: '♜', bishop: '♝', knight: '♞',
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[150] animate-fade-in p-6 bg-black/95 backdrop-blur-xl">
      <div className="max-w-sm w-full space-y-6 text-center border border-accent-blue bg-bg-card p-8">
        {/* Header */}
        <div>
          <div className="section-title justify-center mb-3">Rules Generated</div>
          <h1 className="text-2xl font-black tracking-widest text-white">TODAY'S CHAOS</h1>
          <p className="text-xs text-text-secondary mt-1">Both players share these movement rules</p>
        </div>

        {/* How it works */}
        <div className="text-left p-4 space-y-2 text-xs bg-accent-blue/5 border border-accent-blue/20">
          <div className="text-[10px] font-bold text-accent-bright tracking-widest uppercase">How It Works</div>
          <p className="text-text-secondary leading-relaxed">
            The board looks normal, but the movements of <span className="text-white font-semibold">Queen, Rook, Bishop & Knight</span> are randomly swapped.
          </p>
          <p className="text-text-secondary leading-relaxed font-semibold">
            Example: <span className="text-accent-bright">QUEEN ➔ KNIGHT</span> means your Queen moves exactly like a Knight.
          </p>
          <p className="text-text-dim text-[10px]">* King and Pawns always move normally.</p>
        </div>

        {/* Mappings */}
        <div className="space-y-2">
          {mappings.map((m) => {
            const isSwapped = m.name.toLowerCase() !== m.mapsTo.toLowerCase();
            return (
              <div
                key={m.name}
                className={`flex items-center justify-between px-4 py-3 border ${
                  isSwapped ? 'bg-accent-blue/10 border-accent-blue/40' : 'bg-white/[0.02] border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl opacity-80">{m.icon}</span>
                  <span className="text-sm font-bold tracking-wider text-white">{m.name.toUpperCase()}</span>
                </div>
                <span className="text-text-dim text-lg">➔</span>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold tracking-wider ${isSwapped ? 'text-accent-bright' : 'text-text-secondary'}`}>
                    {m.mapsTo.toUpperCase()}
                  </span>
                  <span className="text-xl opacity-80">{pieceIcon[m.mapsTo.toLowerCase()] || '?'}</span>
                  {isSwapped && <span className="text-[9px] text-accent-bright font-bold">⚡ SWAPPED</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Countdown */}
        <div className="pt-4 space-y-1 border-t border-border">
          <div className="text-[9px] tracking-[0.3em] text-text-secondary font-bold uppercase">Match starts in</div>
          <div className="text-6xl font-mono font-black animate-countdown text-accent-bright">
            {countdown}
          </div>
        </div>
      </div>
    </div>
  );
}
