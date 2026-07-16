import React from 'react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';

export default function LandingPage() {
  const { soundEnabled, setSoundEnabled } = useUIStore();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden animate-fade-in text-white">
      {/* ── Background Effects ── */}
      <div className="vortex-bg">
        <div className="vortex-swirl animate-spin-slow"></div>
        <div className="stars-overlay"></div>
      </div>

      {/* ── Top Navigation (Like the QUAZAR header) ── */}
      <div className="w-full flex items-start justify-center mt-0 px-4 z-10 relative">
        <div className="flex items-center gap-12 pt-4 px-12 border-b border-l border-r border-border-dim/50 rounded-b-3xl bg-bg-elevated/40 backdrop-blur-md">
          
          <div className="flex flex-col items-center cursor-pointer text-text-secondary hover:text-accent-teal transition-colors pb-4 group">
            <div className="text-xl mb-1 group-hover:animate-pulse-teal">📡</div>
            <span className="text-[9px] font-bold tracking-widest uppercase">Multiplayer</span>
          </div>
          
          <div className="flex flex-col items-center cursor-pointer text-text-secondary hover:text-accent-teal transition-colors pb-4 group">
            <div className="text-xl mb-1 group-hover:animate-pulse-teal">🚀</div>
            <span className="text-[9px] font-bold tracking-widest uppercase">Real-Time</span>
          </div>

          {/* Center Logo Shield */}
          <div className="relative -mt-2 px-8 pb-6 flex flex-col items-center justify-center bg-bg-primary/80 backdrop-blur-lg border-b-2 border-accent-teal rounded-b-[40px] shadow-[0_10px_30px_rgba(6,182,212,0.2)]">
            <div className="text-3xl tracking-tighter font-black mt-2">
              C<span className="text-accent-teal text-4xl leading-none">/</span>C
            </div>
            <div className="text-[8px] tracking-[0.3em] font-semibold text-text-secondary mt-1">
              CHAOS CHESS
            </div>
          </div>

          <div className="flex flex-col items-center cursor-pointer text-text-secondary hover:text-accent-teal transition-colors pb-4 group">
            <div className="text-xl mb-1 group-hover:animate-pulse-teal">⭐</div>
            <span className="text-[9px] font-bold tracking-widest uppercase">Ranked</span>
          </div>

          <div
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex flex-col items-center cursor-pointer text-text-secondary hover:text-accent-teal transition-colors pb-4 group"
          >
            <div className="text-xl mb-1 group-hover:animate-pulse-teal">
              {soundEnabled ? '🔊' : '🔇'}
            </div>
            <span className="text-[9px] font-bold tracking-widest uppercase">Sound</span>
          </div>

        </div>
      </div>

      {/* ── Hero Section ── */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full px-6 mt-[-40px]">
        
        <p className="text-xs md:text-sm font-semibold tracking-[0.4em] text-accent-teal mb-4 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
          Launching a new paradigm in chess
        </p>
        
        <h1 className="text-6xl md:text-[7rem] font-black tracking-tight mb-8 drop-shadow-2xl">
          CHAOS<span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">CHESS</span>
        </h1>
        
        <p className="text-sm md:text-base text-gray-300 max-w-xl mb-12 font-medium tracking-wide leading-relaxed">
          A MOBILE & DESKTOP SOLUTION FOR GRANDMASTERS.<br/> 
          RANDOMIZED RULES. INFINITE POSSIBILITIES.
        </p>

        <div className="flex items-center gap-6">
          <Link to="/create" className="btn btn-teal">
            LAUNCH PRIVATE ROOM
          </Link>
          <Link to="/join" className="btn btn-secondary !rounded-full !px-8 hover:!border-white hover:!text-white hover:!bg-white/10 backdrop-blur-sm">
            JOIN ROOM
          </Link>
        </div>

      </div>

      {/* ── Bottom Icons (How to Play) ── */}
      <div className="w-full bg-gradient-to-t from-black/80 to-transparent z-10 pt-16 pb-12 flex justify-center border-t border-accent-teal/20">
        <div className="flex flex-wrap items-start justify-center gap-12 md:gap-24 px-4">
          
          <div className="flex flex-col items-center max-w-[120px] text-center group cursor-default">
            <div className="w-16 h-16 rounded-full border-2 border-accent-teal/40 bg-black/40 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:border-accent-teal group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all">
              <span className="text-2xl text-accent-teal">💧</span>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-white transition-colors">
              Create <span className="text-accent-teal">Room</span>
            </div>
          </div>

          <div className="flex flex-col items-center max-w-[120px] text-center group cursor-default">
            <div className="w-16 h-16 rounded-full border-2 border-accent-teal/40 bg-black/40 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:border-accent-teal group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all">
              <span className="text-2xl text-accent-teal">🛠️</span>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-white transition-colors">
              Random <span className="text-accent-teal">Ruleset</span>
            </div>
          </div>

          <div className="flex flex-col items-center max-w-[120px] text-center group cursor-default">
            <div className="w-16 h-16 rounded-full border-2 border-accent-teal/40 bg-black/40 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:border-accent-teal group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all">
              <span className="text-2xl text-accent-teal">📱</span>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-white transition-colors">
              Mobile <span className="text-accent-teal">Ready</span>
            </div>
          </div>

          <div className="flex flex-col items-center max-w-[120px] text-center group cursor-default">
            <div className="w-16 h-16 rounded-full border-2 border-accent-teal/40 bg-black/40 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:border-accent-teal group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all">
              <span className="text-2xl text-accent-teal">🔗</span>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-white transition-colors">
              Interactive <span className="text-accent-teal">Play</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
