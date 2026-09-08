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
    <div className="relative flex flex-col items-center gap-10 py-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Chess vs <span className="text-gold-400">AI</span>
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Pick a difficulty and start playing.
        </p>
      </div>

      <div className="flex gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
        {(["easy", "medium", "hard"] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setDifficulty(lvl)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              difficulty === lvl
                ? "bg-gold-400/15 text-gold-200 ring-1 ring-gold-400/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {lvl}
          </button>
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
