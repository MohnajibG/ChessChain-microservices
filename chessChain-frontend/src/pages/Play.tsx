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
      <div className="text-center text-white mt-10">
        ❌ No game mode selected. Go back to Home.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center mt-6">
      {mode === "ai" && <ChessAI />}
      {mode === "web3" && <ChessWeb3 />}
      {mode === "free" && <ChessFree />}
    </div>
  );
}
