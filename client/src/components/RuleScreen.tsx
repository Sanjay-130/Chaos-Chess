import React from 'react';
import { useGameStore } from '../store/gameStore';

export default function RuleScreen() {
  const { ruleMapping, countdown } = useGameStore();

  if (!ruleMapping || countdown === null) return null;

  const mappings = [
    { name: 'Queen', mapsTo: ruleMapping.queen },
    { name: 'Rook', mapsTo: ruleMapping.rook },
    { name: 'Bishop', mapsTo: ruleMapping.bishop },
    { name: 'Knight', mapsTo: ruleMapping.knight },
  ];

  return (
    <div className="fixed inset-0 bg-bg-primary/95 flex flex-col items-center justify-center z-[150] animate-fade-in p-6">
      <div className="max-w-md w-full panel p-8 border-2 border-accent-blue space-y-8 text-center">
        <div>
          <span className="badge badge-amber font-bold mb-2">RULES GENERATED</span>
          <h1 className="text-3xl font-black tracking-wider text-text-primary">TODAY'S RULES</h1>
          <p className="text-xs text-text-secondary mt-1">
            Major pieces inherit the movement abilities below.
          </p>
        </div>

        <div className="space-y-3">
          {mappings.map((m) => (
            <div
              key={m.name}
              className="panel px-4 py-3 flex items-center justify-between font-mono bg-bg-secondary"
            >
              <div className="flex items-center gap-2">
                <span className="text-text-primary font-bold">{m.name.toUpperCase()}</span>
              </div>
              <span className="text-text-dim">➔</span>
              <div className="flex items-center gap-2">
                <span className="text-accent-bright font-bold">{m.mapsTo.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border-dim pt-6 space-y-2">
          <div className="text-xs tracking-widest text-text-dim font-bold uppercase">
            MATCH STARTS IN
          </div>
          <div className="text-6xl font-mono font-black text-accent-bright animate-countdown">
            {countdown}
          </div>
        </div>
      </div>
    </div>
  );
}
