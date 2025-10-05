import { useState } from "react";
import { ethers } from "ethers";
import contractAbi from "../abi/CheckChain.json"; // ton ABI

// ⚠️ Mets ici ton adresse de contrat déployé
const CONTRACT_ADDRESS = "0x9086D78910bF21f0cA2508840F8D7fcefC3bf3C1";
const TOKEN_DECIMALS = 6; // USDC/USDT

export default function useChessChain() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  // Connexion wallet
  const connectWallet = async () => {
    if (!window.ethereum) throw new Error("MetaMask non installé");

    const _provider = new ethers.BrowserProvider(window.ethereum);
    await _provider.send("eth_requestAccounts", []);
    const _signer = await _provider.getSigner();
    const _account = await _signer.getAddress();

    const _contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractAbi.abi,
      _signer
    );

    setProvider(_provider);
    setSigner(_signer);
    setContract(_contract);
    setAccount(_account);

    return _account;
  };

  // Créer une partie
  const createGame = async (tokenChoice: number, stake: string) => {
    if (!contract) throw new Error("Contrat non initialisé");
    const stakeAmount = ethers.parseUnits(stake, TOKEN_DECIMALS);
    const tx = await contract.createGame(tokenChoice, stakeAmount);
    await tx.wait();
    return tx.hash;
  };

  // Rejoindre une partie
  const joinGame = async (gameId: number) => {
    if (!contract) throw new Error("Contrat non initialisé");
    const tx = await contract.joinGame(gameId);
    await tx.wait();
    return tx.hash;
  };

  // Faire un coup
  const makeMove = async (gameId: number, move: string) => {
    if (!contract) throw new Error("Contrat non initialisé");
    const tx = await contract.makeMove(gameId, move);
    await tx.wait();
    return tx.hash;
  };

  // Récupérer les parties en attente
  const getWaitingGames = async (offset = 0, limit = 10) => {
    if (!contract) throw new Error("Contrat non initialisé");
    const games = await contract.getWaitingGames(offset, limit);
    return games.map((g: bigint) => g.toString());
  };

  return {
    connectWallet,
    createGame,
    joinGame,
    makeMove,
    getWaitingGames,
    account,
    provider,
    signer,
    contract,
  };
}
