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

  const colorMap: Record<string, string> = { w: "white", b: "black" };
  const typeMap: Record<string, string> = {
    p: "pawn",
    r: "rook",
    n: "knight",
    b: "bishop",
    q: "queen",
    k: "king",
  };

  const isCheckmate = game.isCheckmate();

  return (
    <div className="relative w-[480px] h-[480px] shadow-2xl rounded-lg overflow-hidden border-2 border-gray-700">
      {isCheckmate && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
          <h1 className="text-red-500 text-4xl font-black animate-pulse">
            ÉCHEC & MAT !
          </h1>
        </div>
      )}
      {ranks.map((rank, rIndex) => (
        <div key={rank} className="flex">
          {files.map((file, fIndex) => {
            const square = `${file}${rank}` as Square;
            const isDark = (rIndex + fIndex) % 2 === 1;
            const piece = board[8 - rank][fIndex];
            const isHighlighted = highlightedSquares.includes(square);

            return (
              <div
                key={square}
                onDragOver={(e: React.DragEvent<HTMLDivElement>) =>
                  e.preventDefault()
                }
                onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                  const from = e.dataTransfer.getData("from") as Square;
                  handleDrop(from, square);
                }}
                className={`relative w-[60px] h-[60px] flex items-center justify-center transition-colors ${
                  isDark
                    ? "bg-[url('/textures/wood-dark.jpg')]"
                    : "bg-[url('/textures/wood-light.jpg')]"
                } bg-cover hover:brightness-90`}
              >
                {isHighlighted && (
                  <div className="absolute w-6 h-6 rounded-full bg-yellow-400/50 pointer-events-none animate-pulse"></div>
                )}
                {piece && (
                  <img
                    src={`/pieces/3d/${colorMap[piece.color]}_${
                      typeMap[piece.type]
                    }_a.png`}
                    alt={`${piece.color} ${piece.type}`}
                    className="w-12 h-12 drop-shadow-lg select-none cursor-grab"
                    draggable
                    onDragStart={(e: React.DragEvent<HTMLImageElement>) => {
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
