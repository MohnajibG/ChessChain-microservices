import { useAccount, useBalance, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const history = [
  { label: "vs AI (Easy)", result: "Won" },
  { label: "vs Player", result: "Lost" },
  { label: "vs AI (Hard)", result: "Draw" },
];

const resultStyles: Record<string, string> = {
  Won: "text-emerald-400",
  Lost: "text-rose-400",
  Draw: "text-gold-300",
};

export default function Profile() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <ConnectButton />
      </div>

      {!isConnected ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
          <p className="mb-6 text-zinc-400">
            Connect your wallet to view your stats and history.
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold-300">
              Wallet
            </h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-zinc-500">Address</dt>
                <dd className="mt-1 font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Balance</dt>
                <dd className="mt-1 font-medium">
                  {balance
                    ? `${balance.formatted.slice(0, 6)} ${balance.symbol}`
                    : "Loading…"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold-300">
              Game History
            </h2>
            <ul className="divide-y divide-white/5">
              {history.map((h, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-zinc-300">{h.label}</span>
                  <span className={`font-medium ${resultStyles[h.result]}`}>
                    {h.result}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => disconnect()}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 font-medium text-zinc-300 transition hover:border-rose-400/30 hover:text-rose-300"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
