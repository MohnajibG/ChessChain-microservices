// import { useState } from "react";
// import { Chess, type Square, Move } from "chess.js";

// // Define chessboard coordinates
// const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
// const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

// const initialPosition: Record<string, string> = {
//   a2: "white_pawn_a",
//   b2: "white_pawn_a",
//   c2: "white_pawn_a",
//   d2: "white_pawn_a",
//   e2: "white_pawn_a",
//   f2: "white_pawn_a",
//   g2: "white_pawn_a",
//   h2: "white_pawn_a",
//   a1: "white_rook_a",
//   b1: "white_knight_a",
//   c1: "white_bishop_a",
//   d1: "white_queen_a",
//   e1: "white_king_a",
//   f1: "white_bishop_a",
//   g1: "white_knight_a",
//   h1: "white_rook_a",
//   a7: "black_pawn_a",
//   b7: "black_pawn_a",
//   c7: "black_pawn_a",
//   d7: "black_pawn_a",
//   e7: "black_pawn_a",
//   f7: "black_pawn_a",
//   g7: "black_pawn_a",
//   h7: "black_pawn_a",
//   a8: "black_rook_a",
//   b8: "black_knight_a",
//   c8: "black_bishop_a",
//   d8: "black_queen_a",
//   e8: "black_king_a",
//   f8: "black_bishop_a",
//   g8: "black_knight_a",
//   h8: "black_rook_a",
// };

// // Simple piece values for evaluation
// const pieceValues: Record<string, number> = {
//   p: 1,
//   n: 3,
//   b: 3,
//   r: 5,
//   q: 9,
//   k: 100,
// };

// export default function ChessBoard() {
//   const [game, setGame] = useState(new Chess());
//   const [boardState, setBoardState] =
//     useState<Record<string, string>>(initialPosition);
//   const [promotionData, setPromotionData] = useState<{
//     from: Square;
//     to: Square;
//     color: "w" | "b";
//   } | null>(null);
//   const [highlightedSquares, setHighlightedSquares] = useState<Square[]>([]);
//   const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
//     "easy"
//   );

//   const updateBoardState = (move: Move) => {
//     setBoardState((prev) => {
//       const newState = { ...prev };
//       const { from, to, promotion, color, flags } = move;
//       delete newState[from];

//       if (promotion) {
//         const colorStr = color === "w" ? "white" : "black";
//         const pieceName =
//           promotion === "q"
//             ? "queen"
//             : promotion === "r"
//             ? "rook"
//             : promotion === "b"
//             ? "bishop"
//             : "knight";
//         newState[to] = `${colorStr}_${pieceName}_a`;
//       } else {
//         newState[to] = prev[from];
//       }

//       if (flags.includes("e")) {
//         const capturedSquare = `${to[0]}${
//           color === "w" ? Number(to[1]) - 1 : Number(to[1]) + 1
//         }`;
//         delete newState[capturedSquare];
//       }

//       if (flags.includes("k")) {
//         if (color === "w") {
//           newState["f1"] = newState["h1"];
//           delete newState["h1"];
//         } else {
//           newState["f8"] = newState["h8"];
//           delete newState["h8"];
//         }
//       } else if (flags.includes("q")) {
//         if (color === "w") {
//           newState["d1"] = newState["a1"];
//           delete newState["a1"];
//         } else {
//           newState["d8"] = newState["a8"];
//           delete newState["a8"];
//         }
//       }

//       return newState;
//     });
//   };

//   const handleMove = (
//     from: Square,
//     to: Square,
//     promotion?: "q" | "r" | "b" | "n"
//   ) => {
//     const tempGame = new Chess(game.fen());
//     const move: Move | null = tempGame.move({ from, to, promotion });

//     if (move) {
//       setGame(tempGame);
//       updateBoardState(move);
//       if (tempGame.turn() === "b") {
//         setTimeout(() => aiMove(tempGame), 500);
//       }
//     }
//     setHighlightedSquares([]);
//   };

//   // ---- AI SECTION ----

//   const aiMove = (currentGame: Chess) => {
//     const moves = currentGame.moves({ verbose: true });
//     if (moves.length === 0) return;

//     let chosenMove: Move;

//     if (difficulty === "easy") {
//       // Random move
//       chosenMove = moves[Math.floor(Math.random() * moves.length)];
//     } else if (difficulty === "medium") {
//       // Pick the move with best immediate capture
//       chosenMove = moves.reduce((best, move) => {
//         const pieceVal = move.captured ? pieceValues[move.captured] || 0 : 0;
//         const bestVal = best.captured ? pieceValues[best.captured] || 0 : 0;
//         return pieceVal > bestVal ? move : best;
//       });
//     } else {
//       // Hard mode with minimax depth 2
//       chosenMove = minimaxRoot(currentGame, 2);
//     }

//     currentGame.move(chosenMove);
//     setGame(new Chess(currentGame.fen()));
//     updateBoardState(chosenMove);
//   };

//   const evaluateBoard = (chess: Chess): number => {
//     let total = 0;
//     for (const rank of ranks) {
//       for (const file of files) {
//         const square = `${file}${rank}` as Square;
//         const piece = chess.get(square);
//         if (piece) {
//           const val = pieceValues[piece.type] || 0;
//           total += piece.color === "w" ? val : -val;
//         }
//       }
//     }
//     return total;
//   };

//   const minimaxRoot = (chess: Chess, depth: number): Move => {
//     const moves = chess.moves({ verbose: true });
//     let bestMove = moves[0];
//     let bestValue = -Infinity;

//     for (const move of moves) {
//       const gameCopy = new Chess(chess.fen());
//       gameCopy.move(move);
//       const value = -minimax(gameCopy, depth - 1, false);
//       if (value > bestValue) {
//         bestValue = value;
//         bestMove = move;
//       }
//     }
//     return bestMove;
//   };

//   const minimax = (chess: Chess, depth: number, isMaximizing: boolean) => {
//     if (depth === 0 || chess.isGameOver()) return evaluateBoard(chess);

//     const moves = chess.moves({ verbose: true });
//     if (isMaximizing) {
//       let maxEval = -Infinity;
//       for (const move of moves) {
//         const gameCopy = new Chess(chess.fen());
//         gameCopy.move(move);
//         const evalVal = minimax(gameCopy, depth - 1, false);
//         maxEval = Math.max(maxEval, evalVal);
//       }
//       return maxEval;
//     } else {
//       let minEval = Infinity;
//       for (const move of moves) {
//         const gameCopy = new Chess(chess.fen());
//         gameCopy.move(move);
//         const evalVal = minimax(gameCopy, depth - 1, true);
//         minEval = Math.min(minEval, evalVal);
//       }
//       return minEval;
//     }
//   };

//   // ---- UI ----
//   const handleDrop = (from: Square, to: Square) => {
//     const piece = game.get(from);
//     if (
//       piece?.type === "p" &&
//       ((piece.color === "w" && to[1] === "8") ||
//         (piece.color === "b" && to[1] === "1"))
//     ) {
//       setPromotionData({ from, to, color: piece.color });
//     } else {
//       handleMove(from, to);
//     }
//   };

//   const promotePawn = (promotion: "q" | "r" | "b" | "n") => {
//     if (!promotionData) return;
//     const { from, to } = promotionData;
//     handleMove(from, to, promotion);
//     setPromotionData(null);
//   };

//   return (
//     <div className="relative flex flex-col items-center">
//       <h2 className="text-white text-xl font-bold mb-4">♟️ Chess vs AI</h2>

//       {/* Difficulty selector */}
//       <div className="flex gap-4 mb-4">
//         <label className="flex items-center gap-1">
//           <input
//             type="radio"
//             value="easy"
//             checked={difficulty === "easy"}
//             onChange={() => setDifficulty("easy")}
//           />
//           Easy
//         </label>
//         <label className="flex items-center gap-1">
//           <input
//             type="radio"
//             value="medium"
//             checked={difficulty === "medium"}
//             onChange={() => setDifficulty("medium")}
//           />
//           Medium
//         </label>
//         <label className="flex items-center gap-1">
//           <input
//             type="radio"
//             value="hard"
//             checked={difficulty === "hard"}
//             onChange={() => setDifficulty("hard")}
//           />
//           Hard
//         </label>
//       </div>

//       {/* Chessboard */}
//       <div className="w-[480px] h-[480px] shadow-2xl rounded-lg overflow-hidden">
//         {ranks.map((rank, rIndex) => (
//           <div key={rank} className="flex">
//             {files.map((file, fIndex) => {
//               const square = `${file}${rank}` as Square;
//               const isDark = (rIndex + fIndex) % 2 === 1;
//               const piece = boardState[square];
//               const isHighlighted = highlightedSquares.includes(square);

//               return (
//                 <div
//                   key={square}
//                   onDragOver={(e) => e.preventDefault()}
//                   onDrop={(e) => {
//                     const from = e.dataTransfer.getData("from") as Square;
//                     handleDrop(from, square);
//                   }}
//                   className={`relative w-[60px] h-[60px] flex items-center justify-center ${
//                     isDark
//                       ? "bg-[url('/textures/wood-dark.jpg')]"
//                       : "bg-[url('/textures/wood-light.jpg')]"
//                   } bg-cover`}
//                 >
//                   {isHighlighted && (
//                     <div className="absolute w-6 h-6 rounded-full bg-black/40 pointer-events-none"></div>
//                   )}
//                   {piece && (
//                     <img
//                       src={`/pieces/3d/${piece}.png`}
//                       alt={piece}
//                       className="w-12 h-12 drop-shadow-lg select-none cursor-grab"
//                       draggable
//                       onDragStart={(e) => {
//                         e.dataTransfer.setData("from", square);
//                         const moves = game.moves({ square, verbose: true });
//                         setHighlightedSquares(moves.map((m) => m.to as Square));
//                       }}
//                       onDragEnd={() => setHighlightedSquares([])}
//                     />
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         ))}
//       </div>

//       {promotionData && (
//         <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//           <div className="bg-white p-4 rounded-lg grid grid-cols-4 gap-2">
//             {["q", "r", "b", "n"].map((p) => {
//               const colorStr = promotionData.color === "w" ? "white" : "black";
//               const pieceName =
//                 p === "q"
//                   ? "queen"
//                   : p === "r"
//                   ? "rook"
//                   : p === "b"
//                   ? "bishop"
//                   : "knight";

//               return (
//                 <img
//                   key={p}
//                   src={`/pieces/3d/${colorStr}_${pieceName}_a.png`}
//                   alt={pieceName}
//                   className="w-14 h-14 cursor-pointer hover:scale-110 transition"
//                   onClick={() => promotePawn(p as "q" | "r" | "b" | "n")}
//                 />
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState } from "react";
import { Chess, type Square } from "chess.js";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

export default function ChessBoard() {
  const [game, setGame] = useState(new Chess());
  const [highlightedSquares, setHighlightedSquares] = useState<Square[]>([]);

  const handleMove = (from: Square, to: Square) => {
    const tempGame = new Chess(game.fen());
    const move = tempGame.move({ from, to });
    if (move) {
      setGame(tempGame);
    }
    setHighlightedSquares([]);
  };

  const handleDrop = (from: Square, to: Square) => {
    handleMove(from, to);
  };

  return (
    <div className="relative flex flex-col items-center">
      <h2 className="text-white text-xl font-bold mb-4">♟️ Free Chessboard</h2>
      <div className="w-[480px] h-[480px] shadow-2xl rounded-lg overflow-hidden">
        {ranks.map((rank, rIndex) => (
          <div key={rank} className="flex">
            {files.map((file, fIndex) => {
              const square = `${file}${rank}` as Square;
              const isDark = (rIndex + fIndex) % 2 === 1;
              const piece = game.get(square);
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
                        piece.color === "w" ? "white" : "black"
                      }_${piece.type}_a.png`}
                      alt={piece.type}
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
    </div>
  );
}
