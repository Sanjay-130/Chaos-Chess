import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import { registerHandlers } from './socket/handlers';
import { roomManager } from './rooms/roomManager';

const app = express();
const httpServer = createServer(app);

const PORT = parseInt(process.env.PORT || '3001', 10);

// Support comma-separated CLIENT_URL values e.g. "https://chaos-chess.vercel.app,http://localhost:5173"
const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const ALLOWED_ORIGINS = rawClientUrl.split(',').map((u) => u.trim());

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Provide the io instance to the room manager (for broadcasting)
roomManager.setIO(io);

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);
  registerHandlers(io, socket);
  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Disconnected: ${socket.id} — ${reason}`);
  });
});

// ── Start ──────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Chaos Chess server running on port ${PORT}`);
  console.log(`   Allowed Origins: ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`   Health:     http://localhost:${PORT}/health\n`);
});
