import { Chess } from "chess.js";

/** Reconstruit un boardState fiable à partir d'une FEN. */
export function renderBoardFromFen(fen: string): Record<string, string> {
  const g = new Chess(fen);
  const out: Record<string, string> = {};
  g.board().forEach((rank, rIdx) => {
    rank.forEach((piece, fIdx) => {
      if (!piece) return;
      const file = "abcdefgh"[fIdx];
      const rankNum = 8 - rIdx;
      const square = `${file}${rankNum}`;
      const code = (piece.color === "w" ? "w" : "b") + piece.type.toUpperCase();
      out[square] = code;
    });
  });
  return out;
}
