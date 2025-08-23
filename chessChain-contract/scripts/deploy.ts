import { network } from "hardhat";
import "dotenv/config";

async function main() {
  const { ethers } = await network.connect(); // v3 pattern
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", await deployer.getAddress());

  const token = process.env.TOKEN_ADDRESS;
  if (!token) throw new Error("Missing TOKEN_ADDRESS in .env");

  // Nom EXACT du contrat déclaré dans .sol :
  const checkChain = await ethers.deployContract(
    "CheckChain",
    [token],
    deployer
  );
  await checkChain.waitForDeployment();
  console.log("✅ Deployed at:", await checkChain.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
