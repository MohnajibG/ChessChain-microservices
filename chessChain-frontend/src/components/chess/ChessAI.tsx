import { useState } from "react";
import { Chess, type Square, Move } from "chess.js";
import BoardUI from "./BoardUI";
import initialPosition from "./initialPosition";

export default function ChessAI() {
  const [game, setGame] = useState(new Chess());
  const [boardState, setBoardState] =
    useState<Record<string, string>>(initialPosition);
  const [highlightedSquares, setHighlightedSquares] = useState<Square[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );

  const updateBoardState = (move: Move) => {
    setBoardState((prev) => {
      const newState = { ...prev };
      const { from, to } = move;
      newState[to] = prev[from];
      delete newState[from];
      return newState;
    });
  };

  const handleMove = (from: Square, to: Square) => {
    const tempGame = new Chess(game.fen());
    const move: Move | null = tempGame.move({ from, to });

    if (move) {
      setGame(tempGame);
      updateBoardState(move);
      if (tempGame.turn() === "b") {
        setTimeout(() => aiMove(tempGame), 500);
      }
    }
    setHighlightedSquares([]);
  };

  const aiMove = (currentGame: Chess) => {
    const moves = currentGame.moves({ verbose: true });
    if (moves.length === 0) return;
    const chosenMove = moves[Math.floor(Math.random() * moves.length)];
    currentGame.move(chosenMove);
    setGame(new Chess(currentGame.fen()));
    updateBoardState(chosenMove);
  };

  return (
    <div className="relative flex flex-col items-center gap-16">
      <div className="flex items-center gap-10 ">
        <h2 className="text-[#F78A28] text-4xl font-bold "> CHESS vs AI</h2>
      </div>
      <div className="flex gap-4 mb-4">
        {["easy", "medium", "hard"].map((lvl) => (
          <label key={lvl} className="flex items-center gap-1">
            <input
              type="radio"
              value={lvl}
              checked={difficulty === lvl}
              onChange={() => setDifficulty(lvl as "easy" | "medium" | "hard")}
            />
            {lvl}
          </label>
        ))}
      </div>

      <BoardUI
        boardState={boardState}
        highlightedSquares={highlightedSquares}
        game={game}
        handleDrop={handleMove}
        setHighlightedSquares={setHighlightedSquares}
      />
    </div>
  );
}
