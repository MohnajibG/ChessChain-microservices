/* eslint-disable @typescript-eslint/no-explicit-any */
// handleMatchFound.ts
import { ethers } from "ethers";
import checkChainAbi from "../abi/CheckChain.json";

// Sepolia (Ethereum) = 11155111, Base Sepolia = 84532
const EXPECTED_CHAIN_ID = 11155111 as const;

// Vite env
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as
  | string
  | undefined;

type MatchFoundArgs = {
  gameId: string | number | bigint; // <-- tolère plusieurs formats
  stake: number; // ex: 10 (USDC)
  role: "creator" | "joiner";
};

// (TS) Déclarer ethereum pour éviter les erreurs de type
declare global {
  interface Window {
    ethereum?: any;
  }
}

function assertEnvAddr(name: string, value: string | undefined) {
  if (!value || !ethers.isAddress(value)) {
    throw new Error(
      `Env ${name} manquante ou invalide. Reçu: ${value ?? "undefined"}`
    );
  }
  return value;
}

async function ensureCorrectNetwork(provider: ethers.BrowserProvider) {
  const net = await provider.getNetwork();
  if (Number(net.chainId) === EXPECTED_CHAIN_ID) return;

  try {
    await provider.send("wallet_switchEthereumChain", [
      { chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}` },
    ]);
  } catch (e: any) {
    if (e?.code === 4902) {
      // Si tu veux, ajoute ici wallet_addEthereumChain
      // await provider.send("wallet_addEthereumChain", [{ ... }]);
      throw new Error(
        "Réseau non reconnu. Ajoute-le ou ajuste EXPECTED_CHAIN_ID."
      );
    }
    throw new Error(
      "Changement de réseau refusé. Sélectionne le bon réseau dans ton wallet."
    );
  }
}

export default async function handleMatchFound({
  gameId,
  stake,
  role,
}: MatchFoundArgs) {
  if (!window.ethereum) {
    alert("No wallet found");
    return { ok: false, error: "NO_WALLET" as const };
  }

  // 0) Env & adresses
  const contractAddress = assertEnvAddr(
    "VITE_CONTRACT_ADDRESS",
    CONTRACT_ADDRESS
  );

  // 1) Provider / réseau / signer
  const provider = new ethers.BrowserProvider(window.ethereum);
  await ensureCorrectNetwork(provider);
  const signer = await provider.getSigner();

  // 2) Contrat
  const abi = (checkChainAbi as any).abi ?? checkChainAbi;
  const contract = new ethers.Contract(contractAddress, abi, signer);

  // 3) Montant USDC (6 décimales)
  const amount = ethers.parseUnits(String(stake), 6);

  // 4) (Optionnel) Approve si le contrat fait un transferFrom
  // if (USDC_ADDRESS) {
  //   const usdc = new ethers.Contract(
  //     assertEnvAddr("VITE_USDC_ADDRESS", USDC_ADDRESS),
  //     ["function approve(address,uint256) returns (bool)"],
  //     signer
  //   );
  //   const txA = await usdc.approve(contractAddress, amount);
  //   await txA.wait();
  //   console.log("✅ USDC approved:", txA.hash);
  // }

  // 5) Appels
  try {
    if (role === "creator") {
      const tx = await contract.createGame(amount);
      console.log("⛓️ createGame tx:", tx.hash);
      const receipt = await tx.wait();
      return {
        ok: true,
        action: "createGame" as const,
        txHash: tx.hash,
        receipt,
      };
    }

    if (role === "joiner") {
      // Cast en bigint si joinGame attend un uint256
      const id =
        typeof gameId === "bigint"
          ? gameId
          : typeof gameId === "number"
          ? BigInt(gameId)
          : /^[0-9]+$/.test(String(gameId))
          ? BigInt(gameId)
          : gameId; // si c'est un bytes32 déjà formé

      const tx = await contract.joinGame(id);
      console.log("⛓️ joinGame tx:", tx.hash);
      const receipt = await tx.wait();
      return {
        ok: true,
        action: "joinGame" as const,
        txHash: tx.hash,
        receipt,
      };
    }

    throw new Error(`role invalide: ${role}`);
  } catch (err: any) {
    const msg =
      err?.reason || err?.data?.message || err?.message || "Transaction failed";
    console.error("❌ On-chain error:", msg, err);
    return { ok: false, error: "TX_FAILED" as const, message: msg };
  }
}
