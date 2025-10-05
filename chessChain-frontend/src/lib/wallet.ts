// src/wallet.ts
import { ethers } from "ethers";
import { getContract } from "./contract";

/**
 * Fonction pour connecter le wallet utilisateur via MetaMask
 * et retourner le signer (compte connecté) + l'instance du contrat.
 */
export const connectWallet = async () => {
  // Vérifie la présence de MetaMask
  if (!window.ethereum) {
    throw new Error("❌ MetaMask non détecté. Installez l'extension !");
  }

  // Création d’un provider basé sur la fenêtre Ethereum (MetaMask)
  const provider = new ethers.BrowserProvider(window.ethereum);

  // Demande à l'utilisateur d'autoriser la connexion à son wallet
  await provider.send("eth_requestAccounts", []);

  // Récupère le compte signé (le wallet connecté)
  const signer = await provider.getSigner();

  // Récupère l'adresse du compte
  const address = await signer.getAddress();

  // Récupère une instance du contrat reliée à ce signer
  const contract = getContract(signer);

  console.log("✅ Wallet connecté :", address);
  console.log("✅ Contrat chargé :", contract.target);

  // Retourne tout ce qui est utile pour l'app
  return { provider, signer, address, contract };
};
