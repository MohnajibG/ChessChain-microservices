// hardhat.config.ts
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

export default {
  solidity: "0.8.20",
  plugins: [hardhatEthers],
  networks: {
    // No need to define "hardhat" unless you customize it
    localhost: {
      type: "http", // <= IMPORTANT
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      type: "http", // <= IMPORTANT (était invalide)
      url: SEPOLIA_RPC_URL || "",
      // Clé privée au format 0x... (une seule ou plusieurs)
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
