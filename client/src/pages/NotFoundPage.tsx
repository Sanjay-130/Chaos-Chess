import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="max-w-md w-full mx-auto px-6 py-12 text-center animate-slide-up">
      <div className="panel p-8 space-y-6">
        <h1 className="text-6xl font-black tracking-tight text-accent-bright">404</h1>
        <h2 className="text-xl font-bold tracking-wide">ROOM OR PAGE NOT FOUND</h2>
        <p className="text-sm text-text-secondary">
          The link might be broken, or the room may have expired due to inactivity.
        </p>
        <Link to="/" className="btn btn-primary justify-center w-full">
          RETURN TO LOBBY
        </Link>
      </div>
    </div>
  );
}
