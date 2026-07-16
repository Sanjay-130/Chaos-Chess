import React from 'react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';

export default function LandingPage() {
  const { soundEnabled, setSoundEnabled } = useUIStore();
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center animate-slide-up">
      <div className="mb-4 flex items-center gap-4">
        <span className="badge badge-blue">V1.0.0 ACTIVE</span>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="badge border cursor-pointer hover:bg-bg-hover transition-colors"
          style={{
            borderColor: soundEnabled ? '#22c55e' : '#ef4444',
            color: soundEnabled ? '#4ade80' : '#f87171',
            background: 'transparent',
          }}
        >
          {soundEnabled ? '🔊 SOUND ON' : '🔇 SOUND OFF'}
        </button>
      </div>
      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
        CHAOS <span className="text-accent-bright font-medium">CHESS</span>
      </h1>
      <p className="text-lg text-text-secondary max-w-2xl mb-12">
        A professional, real-time multiplayer chess platform. The board remains identical, but the movement rules of the <span className="text-text-primary font-semibold">Queen, Rook, Bishop, and Knight</span> are randomly scrambled before every game.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-16">
        <Link to="/create" className="btn btn-primary btn-lg justify-center">
          CREATE ROOM
        </Link>
        <Link to="/join" className="btn btn-secondary btn-lg justify-center">
          JOIN ROOM
        </Link>
      </div>

      <div className="panel p-8 w-full text-left">
        <h2 className="text-xl font-bold mb-4 tracking-wide text-text-accent">HOW TO PLAY</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-text-secondary">
          <div>
            <div className="font-bold text-text-primary mb-1">1. CREATE ROOM</div>
            Create a private room and send the invite link or code to a friend. Spectators can join once full.
          </div>
          <div>
            <div className="font-bold text-text-primary mb-1">2. REVEAL THE MAPPING</div>
            When both ready up, a random movement permutation of the 4 major pieces is generated.
          </div>
          <div>
            <div className="font-bold text-text-primary mb-1">3. PLAY TO WIN</div>
            Use the current game's rules to checkmate the enemy king. Pawns and Kings are unaffected.
          </div>
        </div>
      </div>
    </div>
  );
}
