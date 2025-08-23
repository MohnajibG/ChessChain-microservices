import { network } from "hardhat";
import "dotenv/config";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

async function main() {
  const { ethers } = await network.connect();
  const [signer] = await ethers.getSigners();

  const tokenAddr = process.env.TOKEN_ADDRESS;
  if (!tokenAddr) throw new Error("Missing TOKEN_ADDRESS in .env");

  const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
  const decimals: number = await token.decimals();
  const bal = await token.balanceOf(await signer.getAddress());
  console.log("💰 Balance:", ethers.formatUnits(bal, decimals));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
