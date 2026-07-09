import { create } from 'zustand';
import { RoomState, GameState, Color, Move, RuleMapping } from '@chaos-chess/shared';

interface GameStore {
  roomId: string | null;
  roomCode: string | null;
  playerColor: Color | null;
  isSpectator: boolean;
  roomState: RoomState | null;
  gameState: GameState | null;
  nickname: string | null;
  isConnected: boolean;
  drawOfferFrom: string | null;
  ruleMapping: RuleMapping | null;
  countdown: number | null;

  setRoomState: (state: RoomState | null) => void;
  setGameState: (state: GameState | null) => void;
  setRoomId: (id: string | null) => void;
  setRoomCode: (code: string | null) => void;
  setPlayerColor: (color: Color | null) => void;
  setIsSpectator: (isSpec: boolean) => void;
  setNickname: (name: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setDrawOfferFrom: (from: string | null) => void;
  setRuleMapping: (mapping: RuleMapping | null) => void;
  setCountdown: (val: number | null) => void;
  updateTimers: (timers: { white: number; black: number }) => void;
  resetAll: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  roomId: null,
  roomCode: null,
  playerColor: null,
  isSpectator: false,
  roomState: null,
  gameState: null,
  nickname: null,
  isConnected: false,
  drawOfferFrom: null,
  ruleMapping: null,
  countdown: null,

  setRoomState: (roomState) => set({ roomState }),
  setGameState: (gameState) => set({ gameState }),
  setRoomId: (roomId) => set({ roomId }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setPlayerColor: (playerColor) => set({ playerColor }),
  setIsSpectator: (isSpectator) => set({ isSpectator }),
  setNickname: (nickname) => set({ nickname }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setDrawOfferFrom: (drawOfferFrom) => set({ drawOfferFrom }),
  setRuleMapping: (ruleMapping) => set({ ruleMapping }),
  setCountdown: (countdown) => set({ countdown }),
  updateTimers: (timers) =>
    set((state) => {
      if (!state.gameState) return {};
      return {
        gameState: {
          ...state.gameState,
          timers,
        },
      };
    }),
  resetAll: () =>
    set({
      roomId: null,
      roomCode: null,
      playerColor: null,
      isSpectator: false,
      roomState: null,
      gameState: null,
      drawOfferFrom: null,
      ruleMapping: null,
      countdown: null,
    }),
}));
