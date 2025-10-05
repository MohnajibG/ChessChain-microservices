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
    <div className="relative flex flex-col items-center gap-16">
      <h2 className="text-[#F78A28] text-4xl font-bold">
        Free Mode (2 Players)
      </h2>
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
