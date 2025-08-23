import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Charger l’artefact Hardhat
const artifact = JSON.parse(
  fs.readFileSync(new URL("../abi/CheckChain.json", import.meta.url), "utf-8")
);

// Extraire seulement l'ABI
const contractAbi = artifact.abi;

// Provider → RPC Base Sepolia
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Signer = ton wallet admin (⚠️ garde ta clé privée hors du repo)
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Instance du contrat CheckChain
const checkChainContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractAbi,
  signer
);

// Instance du token ERC20 (USDC Sepolia)
const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
];
const tokenContract = new ethers.Contract(
  process.env.TOKEN_ADDRESS,
  erc20Abi,
  signer
);

export { provider, signer, checkChainContract, tokenContract };
