import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export default function MoveHistory() {
  const { gameState } = useGameStore();
  const listRef = useRef<HTMLDivElement>(null);

  const moves = gameState?.moveHistory || [];

  // Scroll to bottom when new moves are added
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [moves.length]);

  // Group moves into pairs (White, Black)
  const pairedMoves: Array<{ round: number; white: string; black?: string }> = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairedMoves.push({
      round: Math.floor(i / 2) + 1,
      white: moves[i].notation || '...',
      black: moves[i + 1]?.notation,
    });
  }

  return (
    <div className="panel flex flex-col h-full">
      <div className="border-b border-border-dim p-3">
        <h2 className="label text-[10px]">MOVE HISTORY</h2>
      </div>

      <div
        ref={listRef}
        className="flex-grow p-3 overflow-y-auto space-y-1.5 font-mono text-sm max-h-[180px] md:max-h-none"
      >
        {pairedMoves.length === 0 ? (
          <div className="text-text-dim text-xs italic p-2">No moves played yet.</div>
        ) : (
          pairedMoves.map((m) => (
            <div key={m.round} className="grid grid-cols-12 hover:bg-bg-hover/50 px-2 py-0.5">
              <span className="col-span-2 text-text-dim text-right pr-3">{m.round}.</span>
              <span className="col-span-5 text-text-primary font-medium">{m.white}</span>
              <span className="col-span-5 text-text-secondary font-medium">
                {m.black || ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
