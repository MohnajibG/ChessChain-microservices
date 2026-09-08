import ChessAI from "../components/chess/ChessAI";
import ChessWeb3 from "../components/chess/ChessWeb3";
import ChessFree from "../components/chess/ChessFree";

export type GameMode = "ai" | "web3" | "free";

interface PlayProps {
  mode: GameMode;
}

export default function Play({ mode }: PlayProps) {
  if (!mode) {
    return (
      <div className="px-6 py-24 text-center text-zinc-400">
        No game mode selected. Go back to Home.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {mode === "ai" && <ChessAI />}
      {mode === "web3" && <ChessWeb3 />}
      {mode === "free" && <ChessFree />}
    </div>
  );
}
