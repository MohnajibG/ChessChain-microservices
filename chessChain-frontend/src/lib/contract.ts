// src/contract.ts
import { ethers } from "ethers";
import contractAbi from "../abi/CheckChain.json"; // le fichier que tu m’as envoyé

// ⚠️ Remplace par l'adresse du contrat déployé
const CONTRACT_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    contractAbi.abi,
    signerOrProvider
  );
}
