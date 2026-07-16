import { Server as SocketServer, Socket } from 'socket.io';
import {
  CreateRoomPayload, JoinRoomPayload, PlayerReadyPayload,
  MakeMovePayload, ResignPayload, DrawOfferPayload,
  DrawResponsePayload, PlayAgainPayload, ReconnectPayload,
} from '@chaos-chess/shared';
import { SOCKET_EVENTS } from '@chaos-chess/shared';
import { roomManager } from '../rooms/roomManager';

export function registerHandlers(io: SocketServer, socket: Socket): void {

  // ── create-room ────────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.CREATE_ROOM, (payload: CreateRoomPayload) => {
    try {
      const { nickname, colorPreference } = payload;
      if (!nickname?.trim()) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Nickname is required' });
        return;
      }

      const { room, color } = roomManager.createRoom(socket.id, nickname.trim(), colorPreference);
      socket.join(room.code);

      socket.emit(SOCKET_EVENTS.ROOM_CREATED, {
        roomCode: room.code,
        roomState: roomManager.getRoomState(room),
        playerColor: color,
      });
    } catch (err) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to create room' });
    }
  });

  // ── join-room ──────────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.JOIN_ROOM, (payload: JoinRoomPayload) => {
    try {
      const { code, nickname } = payload;
      if (!code?.trim() || !nickname?.trim()) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room code and nickname are required' });
        return;
      }

      const result = roomManager.joinRoom(code.trim().toUpperCase(), socket.id, nickname.trim());
      if (!result) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
        return;
      }

      const { room, color, isSpectator } = result;
      socket.join(room.code);

      socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
        roomCode: room.code,
        roomState: roomManager.getRoomState(room),
        playerColor: color,
        isSpectator,
      });

      // Notify others in the room
      socket.to(room.code).emit(SOCKET_EVENTS.ROOM_UPDATED, {
        roomState: roomManager.getRoomState(room),
      });

      if (isSpectator) {
        io.to(room.code).emit(SOCKET_EVENTS.SPECTATOR_JOINED, {
          roomState: roomManager.getRoomState(room),
        });
      }
    } catch (err) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join room' });
    }
  });

  // ── player-ready ───────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.PLAYER_READY, (payload: PlayerReadyPayload) => {
    try {
      const { code } = payload;
      const room = roomManager.setPlayerReady(code, socket.id);
      if (!room) return;

      io.to(code).emit(SOCKET_EVENTS.ROOM_UPDATED, {
        roomState: roomManager.getRoomState(room),
      });

      if (roomManager.bothPlayersReady(code)) {
        roomManager.startCountdown(code);
      }
    } catch (err) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to set ready' });
    }
  });

  // ── make-move ──────────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.MAKE_MOVE, (payload: MakeMovePayload) => {
    try {
      const { code, from, to, promotion } = payload;
      const result = roomManager.makeMove(code, socket.id, from, to, promotion);
      if (!result) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Illegal move' });
        return;
      }

      const { gameState, move } = result;

      io.to(code).emit(SOCKET_EVENTS.MOVE_MADE, { gameState, move });

      if (gameState.status !== 'playing') {
        io.to(code).emit(SOCKET_EVENTS.GAME_OVER, {
          gameState,
          reason: gameState.status,
          winner: gameState.winner,
        });
      }
    } catch (err) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Move processing failed' });
    }
  });

  // ── resign ─────────────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.RESIGN, (payload: ResignPayload) => {
    try {
      const { code } = payload;
      const gameState = roomManager.resign(code, socket.id);
      if (!gameState) return;

      io.to(code).emit(SOCKET_EVENTS.GAME_OVER, {
        gameState,
        reason: 'resigned',
        winner: gameState.winner,
      });
    } catch (err) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to resign' });
    }
  });

  // ── draw-offer ─────────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.DRAW_OFFER, (payload: DrawOfferPayload) => {
    try {
      const { code } = payload;
      const nickname = roomManager.offerDraw(code, socket.id);
      if (!nickname) return;

      socket.to(code).emit(SOCKET_EVENTS.DRAW_OFFERED, { from: nickname });
    } catch (err) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to offer draw' });
    }
  });

  // ── draw-response ──────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.DRAW_RESPONSE, (payload: DrawResponsePayload) => {
    try {
      const { code, accept } = payload;
      if (!accept) {
        socket.to(code).emit(SOCKET_EVENTS.DRAW_DECLINED, {});
        return;
      }

      const gameState = roomManager.respondDraw(code, socket.id, accept);
      if (!gameState) return;

      io.to(code).emit(SOCKET_EVENTS.GAME_OVER, {
        gameState,
        reason: 'draw',
      });
    } catch (err) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to respond to draw' });
    }
  });

  // ── play-again ─────────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.PLAY_AGAIN, (payload: PlayAgainPayload) => {
    try {
      const { code } = payload;
      const bothReady = roomManager.votePlayAgain(code, socket.id);

      const room = roomManager.getRoom(code);
      if (!room) return;

      // Broadcast updated votes
      io.to(code).emit(SOCKET_EVENTS.ROOM_UPDATED, {
        roomState: roomManager.getRoomState(room),
      });

      if (bothReady) {
        const resetRoom = roomManager.resetForNewGame(code);
        if (!resetRoom) return;
        io.to(code).emit(SOCKET_EVENTS.ROOM_UPDATED, {
          roomState: roomManager.getRoomState(resetRoom),
        });
        // Both players ready up automatically for rematch
        for (const player of resetRoom.players) {
          roomManager.setPlayerReady(code, player.socketId);
        }
        roomManager.startCountdown(code);
      }
    } catch (err) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to vote play again' });
    }
  });

  // ── reconnect ──────────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.RECONNECT, (payload: ReconnectPayload) => {
    try {
      const { code, nickname } = payload;
      const result = roomManager.joinRoom(code, socket.id, nickname);
      if (!result) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found or expired' });
        return;
      }

      const { room, color, isSpectator } = result;
      socket.join(room.code);

      socket.emit(SOCKET_EVENTS.RECONNECTED, {
        roomCode: room.code,
        roomState: roomManager.getRoomState(room),
        playerColor: color,
        isSpectator,
      });

      socket.to(room.code).emit(SOCKET_EVENTS.PLAYER_RECONNECTED, {
        roomState: roomManager.getRoomState(room),
        nickname,
      });
    } catch (err) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Reconnection failed' });
    }
  });

  // ── leave-room ─────────────────────────────────────────────────────────────
  socket.on(SOCKET_EVENTS.LEAVE_ROOM, (payload: { code: string }) => {
    socket.leave(payload.code);
  });

  // ── disconnect ─────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const result = roomManager.handleDisconnect(socket.id);
    if (!result) return;

    const { code, nickname } = result;
    const room = roomManager.getRoom(code);
    if (!room) return;

    io.to(code).emit(SOCKET_EVENTS.PLAYER_DISCONNECTED, {
      roomState: roomManager.getRoomState(room),
      nickname,
    });
  });
}
