import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import { registerHandlers } from './socket/handlers';
import { roomManager } from './rooms/roomManager';

const app = express();
const httpServer = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = parseInt(process.env.PORT || '3001', 10);

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: CLIENT_URL,
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
  console.log(`   Client URL: ${CLIENT_URL}`);
  console.log(`   Health:     http://localhost:${PORT}/health\n`);
});
