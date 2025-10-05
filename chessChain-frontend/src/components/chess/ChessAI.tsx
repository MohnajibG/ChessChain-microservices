import { useState } from "react";
import { Chess, type Square, type Move } from "chess.js";
import BoardUI from "./BoardUI";

const ChessAI: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [highlightedSquares, setHighlightedSquares] = useState<Square[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );

  const handleMove = (from: Square, to: Square) => {
    const tempGame = new Chess(game.fen());
    const move = tempGame.move({ from, to });
    if (move) {
      setGame(tempGame);
      if (tempGame.turn() === "b") setTimeout(() => aiMove(tempGame), 400);
    }
    setHighlightedSquares([]);
  };

  const aiMove = (currentGame: Chess) => {
    const moves = currentGame.moves({ verbose: true });
    if (moves.length === 0) return;

    let chosenMove: Move;
    switch (difficulty) {
      case "medium":
        chosenMove =
          moves[Math.floor(Math.random() * Math.min(3, moves.length))];
        break;
      case "hard":
        chosenMove = moves[0];
        break;
      default:
        chosenMove = moves[Math.floor(Math.random() * moves.length)];
    }

    currentGame.move(chosenMove);
    setGame(new Chess(currentGame.fen()));
  };

  return (
    <div className="relative flex flex-col items-center gap-16">
      <h2 className="text-[#F78A28] text-4xl font-bold">CHESS vs AI</h2>

      <div className="flex gap-4 mb-4">
        {["easy", "medium", "hard"].map((lvl) => (
          <label
            key={lvl}
            className="flex items-center gap-1 text-sm capitalize"
          >
            <input
              type="radio"
              value={lvl}
              checked={difficulty === lvl}
              onChange={() => setDifficulty(lvl as "easy" | "medium" | "hard")}
              className="accent-[#F78A28]"
            />
            {lvl}
          </label>
        ))}
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
};

export default ChessAI;
