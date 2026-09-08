import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 tracking-tight">
        Player <span className="text-gold-400">Dashboard</span>
      </h2>

      {/* Wallet Connection */}
      <div className="mb-6">
        <ConnectButton />
      </div>

      <div className="space-y-3 text-sm">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
          <p className="text-zinc-500">Your Address</p>
          <p className="font-mono">0x....</p>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
          <p className="text-zinc-500">Opponent</p>
          <p className="font-mono">Waiting...</p>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
          <p className="text-zinc-500">Your Bet</p>
          <p className="font-semibold text-gold-300">0 NAU</p>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
          <p className="text-zinc-500">Reward if you win</p>
          <p className="font-semibold text-emerald-400">0 NAU</p>
        </div>
      </div>
    </div>
  );
}
