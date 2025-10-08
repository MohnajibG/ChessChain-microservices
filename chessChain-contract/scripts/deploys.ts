// scripts/deploy.ts
import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const TestUSDC = await ethers.getContractFactory("TestUSDC");
  const token = await TestUSDC.deploy();

  await token.deployed();
  console.log("USDC Test deployed at:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
