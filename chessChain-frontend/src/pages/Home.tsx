import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog } from "@headlessui/react";

const modes = [
  {
    id: "web3",
    title: "Web3 Mode",
    description: "Stake USDC/USDT and play for real rewards.",
    icon: "🌐",
  },
  {
    id: "ai",
    title: "Versus AI",
    description: "Sharpen your game against three difficulty levels.",
    icon: "🤖",
  },
  {
    id: "training",
    title: "Training Mode",
    description: "Free, casual play — no wallet required.",
    icon: "🏋️",
  },
];

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleMode = (mode: string) => {
    setIsOpen(false);
    navigate(`/play/${mode}`);
  };

  return (
    <>
      <section className="flex flex-col items-center justify-center px-6 py-28 text-center md:py-40">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gold-300">
          Decentralized Chess
        </span>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Play chess.
          <br />
          <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
            Win real stakes.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-400">
          Challenge friends or AI, stake your tokens and claim the pot when
          you checkmate. Chess, reimagined for Web3.
        </p>
        <button
          onClick={() => setIsOpen(true)}
          className="mt-10 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-8 py-3.5 text-base font-semibold text-zinc-950 shadow-lg shadow-gold-500/20 transition hover:scale-[1.03] hover:shadow-gold-500/40 active:scale-100"
        >
          Play Now
        </button>
      </section>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/95 p-8 shadow-2xl backdrop-blur-xl">
            <Dialog.Title className="mb-6 text-center text-xl font-bold">
              Choose your game mode
            </Dialog.Title>

            <div className="flex flex-col gap-3">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMode(m.id)}
                  className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-gold-400/40 hover:bg-white/[0.06]"
                >
                  <span className="text-2xl">{m.icon}</span>
                  <span>
                    <span className="block font-semibold text-white group-hover:text-gold-300">
                      {m.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-zinc-400">
                      {m.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full text-center text-sm text-zinc-500 transition hover:text-zinc-300"
            >
              Cancel
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
