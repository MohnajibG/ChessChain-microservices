import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  plugins: [hardhatEthers],
  networks: {
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      type: "http",
      url: SEPOLIA_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
