// src/contract.ts
import { ethers } from "ethers";
import contractAbi from "../abi/CheckChain.json"; // le fichier que tu m’as envoyé

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as
  | string
  | undefined;

export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) {
    throw new Error(
      `Env VITE_CONTRACT_ADDRESS manquante ou invalide. Reçu: ${CONTRACT_ADDRESS ?? "undefined"}`
    );
  }

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    contractAbi.abi,
    signerOrProvider
  );
}
