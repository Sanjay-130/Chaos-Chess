import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSocket } from './socket/useSocket';
import LandingPage from './pages/LandingPage';
import CreateRoomPage from './pages/CreateRoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import WaitingRoomPage from './pages/WaitingRoomPage';
import GamePage from './pages/GamePage';
import NotFoundPage from './pages/NotFoundPage';
import ConnectionStatus from './components/ConnectionStatus';

function App() {
  useSocket();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col min-h-screen text-text-primary font-sans relative overflow-hidden bg-bg-primary">
        {/* ── Global Space Background ── */}
        <div className="vortex-bg">
          <div className="vortex-swirl animate-spin-slow" />
          <div className="vortex-core" />
          <div className="stars-overlay" />
        </div>

        <ConnectionStatus />
        <main className="flex-grow flex flex-col justify-center relative z-10">
          <Routes>
            <Route path="/"           element={<LandingPage />} />
            <Route path="/create"     element={<CreateRoomPage />} />
            <Route path="/join"       element={<JoinRoomPage />} />
            <Route path="/join/:code" element={<JoinRoomPage />} />
            <Route path="/room/:code" element={<WaitingRoomPage />} />
            <Route path="/game/:code" element={<GamePage />} />
            <Route path="*"           element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
