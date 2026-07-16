import { v4 as uuidv4 } from 'uuid';
import { Server as SocketServer } from 'socket.io';
import {
  RoomState, PlayerInfo, SpectatorInfo, GameState,
  Color, RoomPhase,
} from '@chaos-chess/shared';
import { ROOM_TTL_MINUTES, RULE_COUNTDOWN_SECONDS, SOCKET_EVENTS } from '@chaos-chess/shared';
import { generateRuleMapping } from '../engine/ruleGenerator';
import { createInitialGameState, applyMove, tickTimer } from '../engine/gameManager';

// ─── Room Data Structure ──────────────────────────────────────────────────────

interface Room {
  code: string;
  players: PlayerInfo[];
  spectators: SpectatorInfo[];
  phase: RoomPhase;
  gameState: GameState | null;
  playAgainVotes: Set<string>;
  cleanupTimer?: ReturnType<typeof setTimeout>;
  gameTimer?: ReturnType<typeof setInterval>;
  countdownTimer?: ReturnType<typeof setTimeout>;
  drawOfferedBy?: string; // socketId
  previousRuleMapping?: any;
  timeControl: number; // in minutes
}

// ─── Room Manager ─────────────────────────────────────────────────────────────

/** Strip server-only fields before sending GameState to clients */
function toClientGameState(gs: GameState): GameState {
  const { positionCounts: _dropped, ...rest } = gs;
  return rest as GameState;
}

class RoomManager {
  private rooms = new Map<string, Room>();
  private io!: SocketServer;

  setIO(io: SocketServer): void {
    this.io = io;
  }

  // ── Room Creation ──────────────────────────────────────────────────────────

  createRoom(socketId: string, nickname: string, colorPreference?: 'white' | 'black' | 'random', timeControl: number = 10): { room: Room; color: Color } {
    const code = this.generateCode();

    // Resolve preferred color: random picks a coin flip
    let assignedColor: Color;
    if (colorPreference === 'black') {
      assignedColor = 'black';
    } else if (colorPreference === 'random') {
      assignedColor = Math.random() < 0.5 ? 'white' : 'black';
    } else {
      assignedColor = 'white'; // default
    }

    const player: PlayerInfo = {
      socketId,
      nickname,
      color: assignedColor,
      isReady: false,
      isConnected: true,
    };

    const room: Room = {
      code,
      players: [player],
      spectators: [],
      phase: 'waiting',
      gameState: null,
      playAgainVotes: new Set(),
      timeControl,
    };

    this.rooms.set(code, room);
    return { room, color: assignedColor };
  }

  // ── Room Joining ───────────────────────────────────────────────────────────

  joinRoom(
    code: string,
    socketId: string,
    nickname: string,
  ): { room: Room; color: Color | null; isSpectator: boolean } | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    // Check for reconnecting player
    for (const player of room.players) {
      if (player.nickname === nickname && !player.isConnected) {
        player.socketId = socketId;
        player.isConnected = true;
        this.cancelCleanup(room);
        return { room, color: player.color, isSpectator: false };
      }
    }

    if (room.players.length < 2) {
      // Second player gets the opposite of the first player's color
      const existingColor = room.players[0].color;
      const color: Color = existingColor === 'white' ? 'black' : 'white';
      const player: PlayerInfo = {
        socketId,
        nickname,
        color,
        isReady: false,
        isConnected: true,
      };
      room.players.push(player);
      return { room, color, isSpectator: false };
    }

    // Spectator
    const spectator: SpectatorInfo = {
      socketId,
      nickname,
      isConnected: true,
    };
    room.spectators.push(spectator);
    return { room, color: null, isSpectator: true };
  }

  // ── Player Ready ───────────────────────────────────────────────────────────

  setPlayerReady(code: string, socketId: string): Room | null {
    const room = this.rooms.get(code);
    if (!room || room.phase !== 'waiting') return null;
    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return null;
    player.isReady = true;
    return room;
  }

  bothPlayersReady(code: string): boolean {
    const room = this.rooms.get(code);
    if (!room || room.players.length < 2) return false;
    return room.players.every(p => p.isReady);
  }

  // ── Game Countdown + Start ─────────────────────────────────────────────────

  startCountdown(code: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    room.phase = 'countdown';
    
    // Generate a mapping, ensuring it is different from the previous one in the same room
    let ruleMapping = generateRuleMapping();
    if (room.previousRuleMapping) {
      let attempts = 0;
      while (
        attempts < 20 &&
        ruleMapping.queen === room.previousRuleMapping.queen &&
        ruleMapping.rook === room.previousRuleMapping.rook &&
        ruleMapping.bishop === room.previousRuleMapping.bishop &&
        ruleMapping.knight === room.previousRuleMapping.knight
      ) {
        ruleMapping = generateRuleMapping();
        attempts++;
      }
    }
    room.previousRuleMapping = ruleMapping;

    let countdown = RULE_COUNTDOWN_SECONDS;

    // Broadcast countdown ticks
    const tick = (): void => {
      this.io.to(code).emit(SOCKET_EVENTS.COUNTDOWN, {
        value: countdown,
        ruleMapping,
      });
      if (countdown === 0) {
        this.startGame(code, ruleMapping);
      } else {
        countdown--;
        room.countdownTimer = setTimeout(tick, 1000);
      }
    };
    tick();
  }

  private startGame(code: string, ruleMapping: ReturnType<typeof generateRuleMapping>): void {
    const room = this.rooms.get(code);
    if (!room) return;

    room.phase = 'playing';
    room.gameState = createInitialGameState(ruleMapping, room.timeControl * 60 * 1000);

    const roomState = this.getRoomState(room);
    this.io.to(code).emit(SOCKET_EVENTS.GAME_STARTED, {
      gameState: toClientGameState(room.gameState),
      roomState,
    });

    // Start server-side timer tick (every 1 second)
    this.startGameTimer(code);
  }

  // ── Timer ──────────────────────────────────────────────────────────────────

  private startGameTimer(code: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    room.gameTimer = setInterval(() => {
      const r = this.rooms.get(code);
      if (!r || !r.gameState || r.phase !== 'playing') {
        clearInterval(r?.gameTimer);
        return;
      }

      const { timers, timedOut } = tickTimer(r.gameState);
      r.gameState = { ...r.gameState, timers };

      if (timedOut) {
        clearInterval(r.gameTimer);
        const winner = r.gameState.turn === 'white' ? 'black' : 'white';
        r.gameState = { ...r.gameState, status: 'timeout', winner };
        r.phase = 'gameover';
        this.io.to(code).emit(SOCKET_EVENTS.GAME_OVER, {
          gameState: r.gameState,
          reason: 'timeout',
          winner,
        });
      } else {
        // Broadcast updated timers only (lightweight)
        this.io.to(code).emit('timer-tick', { timers });
      }
    }, 1000);
  }

  private stopGameTimer(code: string): void {
    const room = this.rooms.get(code);
    if (room?.gameTimer) {
      clearInterval(room.gameTimer);
      room.gameTimer = undefined;
    }
  }

  // ── Move Handling ──────────────────────────────────────────────────────────

  makeMove(
    code: string,
    socketId: string,
    from: number,
    to: number,
    promotion?: string,
  ): { gameState: GameState; move: any } | null {
    const room = this.rooms.get(code);
    if (!room || !room.gameState || room.phase !== 'playing') return null;

    const player = room.players.find(p => p.socketId === socketId);
    if (!player || player.color !== room.gameState.turn) return null;

    const promoPiece = promotion as any;
    const newState = applyMove(room.gameState, from, to, promoPiece);
    if (!newState) return null;

    const move = newState.moveHistory[newState.moveHistory.length - 1];
    room.gameState = newState;

    if (newState.status !== 'playing') {
      this.stopGameTimer(code);
      room.phase = 'gameover';
    }

    return { gameState: newState, move };
  }

  // ── Resign ─────────────────────────────────────────────────────────────────

  resign(code: string, socketId: string): GameState | null {
    const room = this.rooms.get(code);
    if (!room || !room.gameState || room.phase !== 'playing') return null;

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return null;

    const winner: Color = player.color === 'white' ? 'black' : 'white';
    room.gameState = { ...room.gameState, status: 'resigned', winner };
    room.phase = 'gameover';
    this.stopGameTimer(code);

    return room.gameState;
  }

  abandon(code: string, socketId: string): GameState | null {
    const room = this.rooms.get(code);
    if (!room || !room.gameState || room.phase !== 'playing') return null;

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return null;

    const winner: Color = player.color === 'white' ? 'black' : 'white';
    room.gameState = { ...room.gameState, status: 'abandoned', winner };
    room.phase = 'gameover';
    this.stopGameTimer(code);

    return room.gameState;
  }

  // ── Draw ───────────────────────────────────────────────────────────────────

  offerDraw(code: string, socketId: string): string | null {
    const room = this.rooms.get(code);
    if (!room || room.phase !== 'playing') return null;
    room.drawOfferedBy = socketId;
    const player = room.players.find(p => p.socketId === socketId);
    return player?.nickname ?? null;
  }

  respondDraw(code: string, socketId: string, accept: boolean): GameState | null {
    const room = this.rooms.get(code);
    if (!room || !room.gameState || !room.drawOfferedBy) return null;
    if (room.drawOfferedBy === socketId) return null; // can't respond to own offer

    room.drawOfferedBy = undefined;
    if (!accept) return null;

    room.gameState = { ...room.gameState, status: 'draw' };
    room.phase = 'gameover';
    this.stopGameTimer(code);

    return room.gameState;
  }

  // ── Play Again ─────────────────────────────────────────────────────────────

  votePlayAgain(code: string, socketId: string): boolean {
    const room = this.rooms.get(code);
    if (!room || room.phase !== 'gameover') return false;

    room.playAgainVotes.add(socketId);
    const playerCount = room.players.filter(p => p.isConnected).length;
    return room.playAgainVotes.size >= playerCount && playerCount === 2;
  }

  clearPlayAgainVotes(code: string): void {
    const room = this.rooms.get(code);
    if (!room) return;
    room.playAgainVotes = new Set();
  }

  resetForNewGame(code: string): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    room.phase = 'waiting';
    room.gameState = null;
    room.playAgainVotes = new Set();
    room.drawOfferedBy = undefined;
    for (const player of room.players) {
      player.isReady = false;
    }

    return room;
  }

  // ── Disconnect Handling ────────────────────────────────────────────────────

  leaveRoom(socketId: string): { code: string; nickname: string; gameState?: GameState } | null {
    for (const [code, room] of this.rooms) {
      const playerIdx = room.players.findIndex(p => p.socketId === socketId);
      if (playerIdx !== -1) {
        const player = room.players[playerIdx];

        let newGameState: GameState | undefined;
        if (room.phase === 'playing') {
          newGameState = this.abandon(code, socketId) ?? undefined;
        }

        room.players.splice(playerIdx, 1);

        if (room.players.length === 0 && room.spectators.length === 0) {
          this.destroyRoom(code);
        }

        return { code, nickname: player.nickname, gameState: newGameState };
      }

      const specIdx = room.spectators.findIndex(s => s.socketId === socketId);
      if (specIdx !== -1) {
        const spec = room.spectators[specIdx];
        room.spectators.splice(specIdx, 1);

        if (room.players.length === 0 && room.spectators.length === 0) {
          this.destroyRoom(code);
        }

        return { code, nickname: spec.nickname };
      }
    }
    return null;
  }

  handleDisconnect(socketId: string): { code: string; nickname: string; gameState?: GameState } | null {
    for (const [code, room] of this.rooms) {
      // Check players
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        player.isConnected = false;
        this.scheduleCleanup(room);
        
        let newGameState = undefined;
        if (room.phase === 'playing') {
          newGameState = this.abandon(code, socketId) ?? undefined;
        }

        return { code, nickname: player.nickname, gameState: newGameState };
      }

      // Check spectators
      const specIdx = room.spectators.findIndex(s => s.socketId === socketId);
      if (specIdx !== -1) {
        const spec = room.spectators[specIdx];
        room.spectators.splice(specIdx, 1);
        return { code, nickname: spec.nickname };
      }
    }
    return null;
  }

  private destroyRoom(code: string): void {
    const room = this.rooms.get(code);
    if (!room) return;
    this.stopGameTimer(code);
    this.cancelCleanup(room);
    if (room.countdownTimer) {
      clearTimeout(room.countdownTimer);
      room.countdownTimer = undefined;
    }
    this.rooms.delete(code);
  }

  private scheduleCleanup(room: Room): void {
    if (room.cleanupTimer) return;
    const allDisconnected = room.players.every(p => !p.isConnected);
    if (!allDisconnected) return;

    room.cleanupTimer = setTimeout(() => {
      this.rooms.delete(room.code);
    }, ROOM_TTL_MINUTES * 60 * 1000);
  }

  private cancelCleanup(room: Room): void {
    if (room.cleanupTimer) {
      clearTimeout(room.cleanupTimer);
      room.cleanupTimer = undefined;
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  getRoomState(room: Room): RoomState {
    return {
      code: room.code,
      players: room.players,
      spectators: room.spectators,
      phase: room.phase,
      gameState: room.gameState ? toClientGameState(room.gameState) : null,
      playAgainVotes: [...room.playAgainVotes],
      timeControl: room.timeControl,
    };
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
    } while (this.rooms.has(code));
    return code;
  }
}

export const roomManager = new RoomManager();
