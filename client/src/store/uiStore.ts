import { create } from 'zustand';

interface UIStore {
  selectedSquare: string | null;
  legalMoves: string[]; // target squares
  promotionSquare: { from: number; to: number } | null;
  errorMessage: string | null;

  setSelectedSquare: (sq: string | null) => void;
  setLegalMoves: (moves: string[]) => void;
  setPromotionSquare: (promo: { from: number; to: number } | null) => void;
  setErrorMessage: (msg: string | null) => void;
  resetUI: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedSquare: null,
  legalMoves: [],
  promotionSquare: null,
  errorMessage: null,

  setSelectedSquare: (selectedSquare) => set({ selectedSquare }),
  setLegalMoves: (legalMoves) => set({ legalMoves }),
  setPromotionSquare: (promotionSquare) => set({ promotionSquare }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  resetUI: () =>
    set({
      selectedSquare: null,
      legalMoves: [],
      promotionSquare: null,
      errorMessage: null,
    }),
}));
