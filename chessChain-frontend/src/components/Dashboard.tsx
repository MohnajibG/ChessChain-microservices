import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-[#0BB4D9]">
        Player Dashboard
      </h2>

      {/* Wallet Connection */}
      <div className="mb-6">
        <ConnectButton />
      </div>

      <div className="space-y-4 text-sm">
        <div className="p-3 rounded-lg bg-[#032c58]/50 border border-[#2e4b80]">
          <p className="text-gray-400">Your Address</p>
          <p className="font-mono">0x....</p>
        </div>

        <div className="p-3 rounded-lg bg-[#032c58]/50 border border-[#2e4b80]">
          <p className="text-gray-400">Opponent</p>
          <p className="font-mono">Waiting...</p>
        </div>

        <div className="p-3 rounded-lg bg-[#032c58]/50 border border-[#2e4b80]">
          <p className="text-gray-400">Your Bet</p>
          <p className="font-semibold text-[#0BB4D9]">0 NAU</p>
        </div>

        <div className="p-3 rounded-lg bg-[#032c58]/50 border border-[#2e4b80]">
          <p className="text-gray-400">Reward if you win</p>
          <p className="font-semibold text-[#28a745]">0 NAU</p>
        </div>
      </div>
    </div>
  );
}
