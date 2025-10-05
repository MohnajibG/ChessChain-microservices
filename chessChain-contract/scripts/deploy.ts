import { network } from "hardhat";
import "dotenv/config";

async function main() {
  // Récupération de ethers depuis le network connecté
  const { ethers } = await network.connect(); // v3 pattern

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", await deployer.getAddress());

  const usdc = process.env.USDC_ADDRESS;
  const usdt = process.env.USDT_ADDRESS;
  const treasury = process.env.TREASURY_ADDRESS;

  if (!usdc) throw new Error("Missing USDC_ADDRESS in .env");
  if (!usdt) throw new Error("Missing USDT_ADDRESS in .env");
  if (!treasury) throw new Error("Missing TREASURY_ADDRESS in .env");

  // Déploiement du contrat ChessChainDecentralized
  const chessChain = await ethers.deployContract(
    "ChessChainDecentralized",
    [usdc, usdt, treasury],
    deployer
  );

  await chessChain.waitForDeployment();
  console.log(
    "✅ ChessChainDecentralized deployed at:",
    await chessChain.getAddress()
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
