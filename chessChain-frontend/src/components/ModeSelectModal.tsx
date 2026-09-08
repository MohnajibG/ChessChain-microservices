import type { GameMode } from "../pages/Play";

interface Props {
  onClose: () => void;
  onSelectMode: (mode: GameMode) => void;
}

const modes: { id: GameMode; label: string; icon: string }[] = [
  { id: "ai", label: "Play vs AI", icon: "🤖" },
  { id: "web3", label: "Web3 Mode (Wallet)", icon: "💸" },
  { id: "free", label: "Free Mode", icon: "🎲" },
];

export default function ModeSelectModal({ onClose, onSelectMode }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900/95 border border-white/10 rounded-3xl p-6 w-80 text-center shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Choose Game Mode</h2>

        <div className="flex flex-col gap-3">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className="py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-zinc-200 font-medium hover:border-gold-400/40 hover:text-gold-200 transition"
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 text-sm text-zinc-500 hover:text-zinc-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
