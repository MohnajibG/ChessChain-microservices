import { useAccount, useBalance, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Profile() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#044352] to-[#032c58] text-white font-outfit">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-[#2e4b80]">
        <h1 className="text-2xl font-bold text-[#0BB4D9]">👤 Profile</h1>
        <ConnectButton />
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        {!isConnected ? (
          <div className="text-center">
            <p className="text-lg text-gray-300 mb-4">
              Please connect your wallet
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl max-w-md w-full">
            {/* Wallet Info */}
            <h2 className="text-xl font-bold text-[#0BB4D9] mb-4">
              Wallet Information
            </h2>
            <p className="mb-2">
              <span className="font-semibold text-[#F78A28]">Address:</span>{" "}
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <p className="mb-4">
              <span className="font-semibold text-[#F78A28]">Balance:</span>{" "}
              {balance
                ? `${balance.formatted.slice(0, 6)} ${balance.symbol}`
                : "Loading..."}
            </p>

            {/* Game History */}
            <h2 className="text-xl font-bold text-[#0BB4D9] mb-3">
              Game History
            </h2>
            <ul className="space-y-2 text-gray-200">
              <li className="bg-[#2e4b80]/40 p-3 rounded-md flex justify-between">
                <span>vs AI (Easy)</span>
                <span className="text-green-400">✅ Won</span>
              </li>
              <li className="bg-[#2e4b80]/40 p-3 rounded-md flex justify-between">
                <span>vs Player</span>
                <span className="text-red-400">❌ Lost</span>
              </li>
              <li className="bg-[#2e4b80]/40 p-3 rounded-md flex justify-between">
                <span>vs AI (Hard)</span>
                <span className="text-yellow-400">➖ Draw</span>
              </li>
            </ul>

            {/* Disconnect */}
            <button
              onClick={() => disconnect()}
              className="mt-6 w-full py-3 rounded-lg bg-[#F78A28] hover:bg-[#0BB4D9] transition font-semibold"
            >
              Disconnect
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
