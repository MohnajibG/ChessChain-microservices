import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ---------------------------
// 🔹 Définition des chains custom
// ---------------------------
const worldchainMainnet = {
  id: 480,
  name: "WorldChain Mainnet",
  nativeCurrency: { name: "World ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://worldchain-mainnet.g.alchemy.com/v2/MIpfvMc80Vj8qauZMIsfx",
      ],
    },
  },
};

const worldchainSepolia = {
  id: 4801,
  name: "WorldChain Sepolia",
  nativeCurrency: { name: "Sepolia World ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://worldchain-sepolia.g.alchemy.com/v2/MIpfvMc80Vj8qauZMIsfx",
      ],
    },
  },
};

// ---------------------------
// 🔹 wagmi config
// ---------------------------
const config = createConfig({
  chains: [worldchainMainnet, worldchainSepolia],
  transports: {
    [worldchainMainnet.id]: http(
      "https://worldchain-mainnet.g.alchemy.com/v2/MIpfvMc80Vj8qauZMIsfx"
    ),
    [worldchainSepolia.id]: http(
      "https://worldchain-sepolia.g.alchemy.com/v2/MIpfvMc80Vj8qauZMIsfx"
    ),
  },
  connectors: [
    injected({ target: "metaMask" }), // 👈 force MetaMask
    injected({ target: "braveWallet" }), // 👈 force Brave
    injected({ target: "rabby" }), // 👈 force Rabby
    injected(), // 👈 fallback: n’importe quel wallet injecté
  ],
  // autoConnect has been removed since it is not recognized in the config type.
});

const queryClient = new QueryClient();

// ---------------------------
// 🔹 Render
// ---------------------------
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
