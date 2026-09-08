import { useState } from "react";
import { Chess, type Square } from "chess.js";
import BoardUI from "./BoardUI";

export default function ChessFree() {
  const [game, setGame] = useState(new Chess());
  const [highlightedSquares, setHighlightedSquares] = useState<Square[]>([]);

  const handleMove = (from: Square, to: Square) => {
    const tempGame = new Chess(game.fen());
    const move = tempGame.move({ from, to });
    if (move) setGame(tempGame);
    setHighlightedSquares([]);
  };

  return (
    <div className="relative flex flex-col items-center gap-10 py-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Free <span className="text-gold-400">Play</span>
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Local two-player mode — no wallet needed.
        </p>
      </div>
      <BoardUI
        board={game.board()}
        highlightedSquares={highlightedSquares}
        handleDrop={handleMove}
        setHighlightedSquares={setHighlightedSquares}
        game={game}
      />
    </div>
  );
}
