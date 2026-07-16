import { create } from 'zustand';

interface UIStore {
  selectedSquare: string | null;
  legalMoves: string[]; // target squares
  promotionSquare: { from: number; to: number } | null;
  errorMessage: string | null;
  soundEnabled: boolean;
  rematchDeclined: boolean;

  setSelectedSquare: (sq: string | null) => void;
  setLegalMoves: (moves: string[]) => void;
  setPromotionSquare: (promo: { from: number; to: number } | null) => void;
  setErrorMessage: (msg: string | null) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setRematchDeclined: (v: boolean) => void;
  resetUI: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedSquare: null,
  legalMoves: [],
  promotionSquare: null,
  errorMessage: null,
  soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
  rematchDeclined: false,

  setSelectedSquare: (selectedSquare) => set({ selectedSquare }),
  setLegalMoves: (legalMoves) => set({ legalMoves }),
  setPromotionSquare: (promotionSquare) => set({ promotionSquare }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setSoundEnabled: (enabled) => {
    localStorage.setItem('soundEnabled', enabled.toString());
    set({ soundEnabled: enabled });
  },
  setRematchDeclined: (rematchDeclined) => set({ rematchDeclined }),
  resetUI: () =>
    set({
      selectedSquare: null,
      legalMoves: [],
      promotionSquare: null,
      errorMessage: null,
    }),
}));
