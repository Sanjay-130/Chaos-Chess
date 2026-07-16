import React from 'react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';

export default function LandingPage() {
  const { soundEnabled, setSoundEnabled } = useUIStore();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center text-white animate-fade-in">

      {/* ── Top Nav Bar ────────────────────────────────────────────────────── */}
      <div className="w-full relative z-10 flex justify-center">
        <div className="flex items-stretch border-l border-r border-b border-border bg-bg-card/90 backdrop-blur-md">
          {[
            { icon: '📡', label: 'Multiplayer' },
            { icon: '🚀', label: 'Real-Time' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center px-8 py-4 cursor-pointer border-r border-border hover:bg-accent-blue/5 transition-all group"
            >
              <span className="text-lg mb-1 group-hover:text-accent-bright transition-colors">{item.icon}</span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-text-secondary group-hover:text-accent-bright transition-colors uppercase">{item.label}</span>
            </div>
          ))}

          {/* Center Logo */}
          <div className="flex flex-col items-center justify-center px-12 py-3 border-r border-border bg-accent-blue/5 border-b-2 border-b-accent-blue">
            <div className="text-2xl font-black tracking-tighter">
              C<span className="text-accent-bright">/</span>C
            </div>
            <div className="text-[8px] tracking-[0.3em] font-bold text-text-secondary mt-0.5 uppercase">
              Chaos Chess
            </div>
          </div>

          {[
            { icon: '⭐', label: 'Ranked' },
            { icon: soundEnabled ? '🔊' : '🔇', label: 'Sound', onClick: () => setSoundEnabled(!soundEnabled) },
          ].map((item) => (
            <div
              key={item.label}
              onClick={item.onClick}
              className="flex flex-col items-center justify-center px-8 py-4 cursor-pointer border-l border-border hover:bg-accent-blue/5 transition-all group"
            >
              <span className="text-lg mb-1 group-hover:text-accent-bright transition-colors">{item.icon}</span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-text-secondary group-hover:text-accent-bright transition-colors uppercase">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full px-6 py-16">

        <div className="text-[10px] font-bold tracking-[0.4em] mb-6 uppercase text-accent-bright">
          Launching a new paradigm in chess
        </div>

        <h1 className="text-7xl md:text-[8rem] font-black tracking-tight mb-6 leading-none">
          CHAOS<br />
          <span className="text-gradient">CHESS</span>
        </h1>

        <p className="text-sm text-text-secondary max-w-lg mb-12 leading-relaxed tracking-wide">
          A MULTIPLAYER EXPERIENCE FOR GRANDMASTERS<br />
          RANDOMIZED RULES · INFINITE POSSIBILITIES
        </p>

        <div className="flex items-center gap-4">
          <Link
            to="/create"
            className="btn btn-primary btn-lg"
            style={{ minWidth: 200, letterSpacing: '0.15em' }}
          >
            LAUNCH ROOM
          </Link>
          <Link
            to="/join"
            className="btn btn-secondary btn-lg"
            style={{ minWidth: 160 }}
          >
            JOIN ROOM
          </Link>
        </div>
      </div>

      {/* ── Bottom Feature Icons ────────────────────────────────────────────── */}
      <div className="w-full z-10 border-t border-border py-10 px-6 bg-bg-secondary/80 backdrop-blur-md">
        <div className="flex flex-wrap justify-center gap-16">
          {[
            { icon: '💧', label: 'Create', sub: 'Private Room' },
            { icon: '🛠️', label: 'Random', sub: 'Ruleset' },
            { icon: '📱', label: 'Mobile', sub: 'Ready' },
            { icon: '🔗', label: 'Live', sub: 'Multiplayer' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center group cursor-default">
              <div className="w-14 h-14 flex items-center justify-center mb-3 border border-border group-hover:border-accent-blue transition-all bg-accent-blue/5 group-hover:bg-accent-blue/10">
                <span className="text-xl">{item.icon}</span>
              </div>
              <div className="text-[9px] font-bold text-text-secondary uppercase tracking-widest group-hover:text-white transition-colors">
                {item.label} <span className="text-accent-bright">{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
