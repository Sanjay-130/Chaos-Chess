import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="max-w-md w-full mx-auto px-6 py-12 text-center animate-slide-up">
      <div className="panel p-10 space-y-6">
        <div className="text-7xl font-black tracking-tight font-mono text-accent-bright">
          404
        </div>
        <div className="divider" />
        <h2 className="text-lg font-bold tracking-widest text-white">ROOM NOT FOUND</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          The link might be broken, or the room may have expired due to inactivity.
        </p>
        <Link to="/" className="btn btn-primary w-full justify-center">
          RETURN TO LOBBY
        </Link>
      </div>
    </div>
  );
}
