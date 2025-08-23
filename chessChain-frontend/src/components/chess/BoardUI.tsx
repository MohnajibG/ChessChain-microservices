/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Square } from "chess.js";

interface BoardUIProps {
  boardState: Record<string, string>;
  highlightedSquares: Square[];
  game: any;
  handleDrop: (from: Square, to: Square) => void;
  setHighlightedSquares: (s: Square[]) => void;
}

export default function BoardUI({
  boardState,
  highlightedSquares,
  game,
  handleDrop,
  setHighlightedSquares,
}: BoardUIProps) {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="w-[480px] h-[480px] shadow-2xl rounded-lg overflow-hidden">
      {ranks.map((rank, rIndex) => (
        <div key={rank} className="flex">
          {files.map((file, fIndex) => {
            const square = `${file}${rank}` as Square;
            const isDark = (rIndex + fIndex) % 2 === 1;
            const piece = boardState[square]; // ← vient de initialPosition
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
                {/* Cercle de highlight */}
                {isHighlighted && (
                  <div className="absolute w-6 h-6 rounded-full bg-black/40 pointer-events-none"></div>
                )}

                {/* Pièce */}
                {piece && (
                  <img
                    src={`/pieces/3d/${piece}.png`}
                    alt={piece}
                    className="w-12 h-12 drop-shadow-lg select-none cursor-grab"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("from", square);
                      const moves = game.moves({ square, verbose: true });
                      setHighlightedSquares(
                        moves.map((m: { to: string }) => m.to as Square)
                      );
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
}
