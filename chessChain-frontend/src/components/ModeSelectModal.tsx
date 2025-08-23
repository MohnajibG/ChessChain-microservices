import type { GameMode } from "../pages/Play";

interface Props {
  onClose: () => void;
  onSelectMode: (mode: GameMode) => void;
}

export default function ModeSelectModal({ onClose, onSelectMode }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 text-center shadow-xl">
        <h2 className="text-xl font-bold mb-4">🎮 Choose Game Mode</h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSelectMode("ai")}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Play vs AI 🤖
          </button>

          <button
            onClick={() => onSelectMode("web3")}
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Web3 Mode (Wallet) 💸
          </button>

          <button
            onClick={() => onSelectMode("free")}
            className="bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
          >
            Free Mode 🎲
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-5 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
