import { type Square, type Chess, type Piece } from "chess.js";

interface BoardUIProps {
  board: (Piece | null)[][];
  highlightedSquares: Square[];
  handleDrop: (from: Square, to: Square) => void;
  setHighlightedSquares: (squares: Square[]) => void;
  game: Chess;
}

const BoardUI: React.FC<BoardUIProps> = ({
  board,
  highlightedSquares,
  handleDrop,
  setHighlightedSquares,
  game,
}) => {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="w-[480px] h-[480px] shadow-2xl rounded-lg overflow-hidden">
      {ranks.map((rank, rIndex) => (
        <div key={rank} className="flex">
          {files.map((file, fIndex) => {
            const square = `${file}${rank}` as Square;
            const isDark = (rIndex + fIndex) % 2 === 1;
            const piece = board[8 - rank][fIndex]; // chess.js board: 0-index top-left
            const isHighlighted = highlightedSquares.includes(square);

            return (
              <div
                key={square}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const from = e.dataTransfer.getData("from") as Square;
                  handleDrop(from, square);
                }}
                className={`relative w-[60px] h-[60px] flex items-center justify-center ${
                  isDark
                    ? "bg-[url('/textures/wood-dark.jpg')]"
                    : "bg-[url('/textures/wood-light.jpg')]"
                } bg-cover`}
              >
                {isHighlighted && (
                  <div className="absolute w-6 h-6 rounded-full bg-black/40 pointer-events-none"></div>
                )}

                {piece && (
                  <img
                    src={`/pieces/3d/${
                      piece.color
                    }${piece.type.toUpperCase()}.png`}
                    alt={`${piece.color}${piece.type}`}
                    className="w-12 h-12 drop-shadow-lg select-none cursor-grab"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("from", square);
                      const moves = game.moves({ square, verbose: true });
                      setHighlightedSquares(moves.map((m) => m.to as Square));
                    }}
                    onDragEnd={() => setHighlightedSquares([])}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default BoardUI;
