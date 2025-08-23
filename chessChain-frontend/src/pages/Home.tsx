import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleMode = (mode: string) => {
    setIsOpen(false);
    navigate(`/play/${mode}`); // 👈 envoie vers une route claire
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#044352] to-[#032c58] text-white font-outfit">
      {/* Hero section */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-[#0BB4D9] drop-shadow-lg">
          Play Chess. Win Tokens.
        </h2>
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-8">
          Challenge your friends or AI, bet your tokens and win rewards when you
          checkmate. A new way to play chess on Web3.
        </p>
        <button
          onClick={() => setIsOpen(true)}
          className="px-8 py-3 rounded-full bg-[#F78A28] hover:bg-[#0BB4D9] text-lg font-semibold shadow-lg transition"
        >
          🚀 Play Now
        </button>
      </main>

      {/* Modal */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-2xl bg-[#044352] border border-[#2e4b80] p-6 shadow-xl text-white">
            <Dialog.Title className="text-2xl font-bold mb-6 text-center text-[#0BB4D9]">
              Choose your game mode
            </Dialog.Title>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleMode("web3")}
                className="py-3 px-4 rounded-lg bg-[#F78A28] hover:bg-[#0BB4D9] font-semibold shadow-lg transition"
              >
                🌐 Web3 Mode (Wallet)
              </button>
              <button
                onClick={() => handleMode("ai")}
                className="py-3 px-4 rounded-lg bg-[#2e4b80] hover:bg-[#2e5f9e] font-semibold shadow-lg transition"
              >
                🤖 Play vs AI
              </button>
              <button
                onClick={() => handleMode("training")}
                className="py-3 px-4 rounded-lg bg-[#032c58] hover:bg-[#06458a] font-semibold shadow-lg transition"
              >
                🏋️ Training Mode
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-400 hover:text-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
