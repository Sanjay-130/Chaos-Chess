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

        {/* How it works educational box */}
        <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-lg p-4 text-left space-y-2 text-xs">
          <h3 className="font-bold text-accent-bright tracking-wider uppercase" style={{ fontSize: '10px' }}>How it works:</h3>
          <p className="text-text-secondary leading-relaxed" style={{ fontSize: '11px' }}>
            In Chaos Chess, the board looks normal, but the movement rules of the **Queen, Rook, Bishop, and Knight** are randomly swapped. Both players share the same rules.
          </p>
          <p className="text-text-secondary leading-relaxed font-semibold" style={{ fontSize: '11px' }}>
            Example: If <span className="text-accent-bright">QUEEN ➔ KNIGHT</span>, your Queen moves exactly like a Knight.
          </p>
          <p className="text-text-dim" style={{ fontSize: '10px' }}>
            * King and Pawns are unaffected and always move normally.
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
