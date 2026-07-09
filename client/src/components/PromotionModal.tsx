import React from 'react';
import { PieceType } from '@chaos-chess/shared';
import { useUIStore } from '../store/uiStore';
import { useGameStore } from '../store/gameStore';
import { socket } from '../socket/socket';
import { SOCKET_EVENTS } from '@chaos-chess/shared';

const OPTIONS: Array<{ type: PieceType; label: string; symbol: string }> = [
  { type: 'queen', label: 'QUEEN', symbol: '♛' },
  { type: 'rook', label: 'ROOK', symbol: '♜' },
  { type: 'bishop', label: 'BISHOP', symbol: '♝' },
  { type: 'knight', label: 'KNIGHT', symbol: '♞' },
];

export default function PromotionModal() {
  const { promotionSquare, setPromotionSquare } = useUIStore();
  const { roomCode } = useGameStore();

  if (!promotionSquare || !roomCode) return null;

  const handleSelect = (type: PieceType) => {
    socket.emit(SOCKET_EVENTS.MAKE_MOVE, {
      code: roomCode,
      from: promotionSquare.from,
      to: promotionSquare.to,
      promotion: type,
    });
    setPromotionSquare(null);
  };

  const handleCancel = () => {
    setPromotionSquare(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[120] p-4">
      <div className="max-w-xs w-full panel p-6 border border-accent-blue space-y-4">
        <h3 className="text-center font-bold tracking-wider text-text-primary uppercase text-sm">
          Pawn Promotion
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => handleSelect(opt.type)}
              className="btn btn-secondary flex-col py-4 font-mono font-bold hover:border-accent-blue hover:text-accent-bright"
            >
              <span className="text-2xl mb-1">{opt.symbol}</span>
              <span className="text-[10px] tracking-widest">{opt.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleCancel}
          className="btn btn-ghost w-full font-bold text-xs"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}
