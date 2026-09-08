import { useState } from "react";
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
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

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
  const lastMove = game.history({ verbose: true }).slice(-1)[0];

  return (
    <div className="inline-block rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent p-[3px] shadow-2xl shadow-black/50">
      <div className="relative w-[480px] h-[480px] rounded-[14px] overflow-hidden border border-gold-400/20 ring-1 ring-black/40">
        {isCheckmate && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-20">
            <h1 className="text-rose-400 text-4xl font-black animate-pulse tracking-wide">
              CHECKMATE
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
              const isSelected = selectedSquare === square;
              const isLastMove =
                lastMove &&
                (lastMove.from === square || lastMove.to === square);
              const labelTone =
                "text-gold-200/90 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.85)]";

              return (
                <div
                  key={square}
                  onDragOver={(e: React.DragEvent<HTMLDivElement>) =>
                    e.preventDefault()
                  }
                  onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                    const from = e.dataTransfer.getData("from") as Square;
                    handleDrop(from, square);
                    setSelectedSquare(null);
                  }}
                  className={`relative w-[60px] h-[60px] flex items-center justify-center transition-colors ${
                    isDark
                      ? "bg-[url('/textures/wood-dark.jpg')]"
                      : "bg-[url('/textures/wood-light.jpg')]"
                  } bg-cover hover:brightness-90`}
                >
                  {isLastMove && (
                    <div className="absolute inset-0 bg-gold-300/20 pointer-events-none" />
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 ring-2 ring-inset ring-gold-300/80 pointer-events-none" />
                  )}
                  {fIndex === 0 && (
                    <span
                      className={`absolute top-0.5 left-1 text-[10px] font-semibold select-none pointer-events-none ${labelTone}`}
                    >
                      {rank}
                    </span>
                  )}
                  {rIndex === 7 && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[10px] font-semibold select-none pointer-events-none ${labelTone}`}
                    >
                      {file}
                    </span>
                  )}
                  {isHighlighted && (
                    <div className="absolute w-6 h-6 rounded-full bg-gold-400/50 pointer-events-none animate-pulse"></div>
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
                        setSelectedSquare(square);
                        const moves = game.moves({ square, verbose: true });
                        setHighlightedSquares(
                          moves.map((m) => m.to as Square)
                        );
                      }}
                      onDragEnd={() => {
                        setHighlightedSquares([]);
                        setSelectedSquare(null);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardUI;
