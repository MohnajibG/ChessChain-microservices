/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo } from "react";
import { Chess, type Square } from "chess.js";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { io, type Socket } from "socket.io-client";
import axios from "axios";

import BoardUI from "./BoardUI";
import handleMatchFound from "../../lib/handleMatchFound";
import { type MoveEvent } from "./types";

import Chip from "./atoms/Chip";
import Card from "./atoms/Card";
import Badge from "./atoms/Badge";
import Skeleton from "./atoms/Skeleton";

import { ethers, type BrowserProvider } from "ethers";

// ------------------- CONSTANTES -------------------
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/queue";

const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// Minimal ERC20 ABI pour check balance / allowance / approve
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

// ------------------- COMPONENT -------------------
export default function ChessWeb3() {
  // --- WALLET ---
  const { address, isConnected } = useAccount();
  // const { data: _walletClient } = useWalletClient();
  const userAddress = address ?? "";

  // --- ÉTATS DE JEU ---
  const [game, setGame] = useState(() => new Chess());
  const [highlightedSquares, setHighlightedSquares] = useState<Square[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [playerRole, setPlayerRole] = useState<"creator" | "joiner" | null>(
    null
  );
  const [stake, setStake] = useState<number | null>(null);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  // --- STATS JOUEUR ---
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  // --- REFS ---
  const socketRef = useRef<Socket | null>(null);
  const gameRef = useRef<Chess>(new Chess());

  // --- CALCULS MEMO ---
  const potentialGain = useMemo(() => {
    return stake ? Math.round(stake * 2 * 0.95 * 1000) / 1000 : null;
  }, [stake]);

  const matchReady = !!roomId && !!opponent;

  const winrate = useMemo(() => {
    return gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
  }, [gamesPlayed, wins]);

  // ------------------- FONCTION CHECK FUNDS & ALLOWANCE -------------------
  const checkFundsAndAllowance = async (
    userAddr: string,
    stakeAmount: number,
    tokenAddress = USDC_ADDRESS,
    requireAllowanceFor = CONTRACT_ADDRESS,
    signerOrProvider?: ethers.Signer | BrowserProvider
  ): Promise<{
    ok: boolean;
    reason?: string;
    approveNeeded?: boolean;
    approveAmount?: string;
  }> => {
    try {
      if (!tokenAddress)
        return { ok: false, reason: "Token address not configured" };

      const provider =
        signerOrProvider ??
        new ethers.BrowserProvider((window as any).ethereum);

      const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const decimals = await token.decimals().catch(() => 6);
      const stakeUnits = ethers.parseUnits(stakeAmount.toString(), decimals);

      const balance: bigint = await token.balanceOf(userAddr);
      if (balance < stakeUnits) {
        return { ok: false, reason: "Insufficient token balance" };
      }

      const allowance: bigint = await token.allowance(
        userAddr,
        requireAllowanceFor
      );
      if (allowance < stakeUnits) {
        return {
          ok: true,
          approveNeeded: true,
          approveAmount: stakeUnits.toString(),
        };
      }

      return { ok: true };
    } catch (e) {
      console.error("checkFunds error", e);
      return { ok: false, reason: "Error checking token balance" };
    }
  };

  // ------------------- SOCKETS -------------------
  useEffect(() => {
    const s = io(SOCKET_URL, { autoConnect: false });
    socketRef.current = s;

    // Assignation couleur et rôle
    s.on("assignColor", (color: "white" | "black") => setPlayerColor(color));
    s.on("assignRole", (role: "creator" | "joiner") => setPlayerRole(role));

    // Opponent events
    s.on("opponentJoined", (addr: string) => setOpponent(addr));
    s.on("opponentMove", ({ from, to }: MoveEvent) => {
      const g = gameRef.current;
      const m = g.move({ from, to });
      if (!m) return;
      gameRef.current = g;
      setGame(new Chess(g.fen()));
      setHighlightedSquares([]);
    });

    // Match found
    s.on("matchFound", ({ creator, joiner }) => {
      const me = userAddress.toLowerCase();
      if (creator.opponent?.toLowerCase() === me) {
        handleMatchFound({
          gameId: joiner.gameId,
          stake: joiner.stake,
          role: "joiner",
        });
      } else if (joiner.opponent?.toLowerCase() === me) {
        handleMatchFound({
          gameId: creator.gameId,
          stake: creator.stake,
          role: "creator",
        });
      }
    });

    // Game over
    s.on("gameOver", ({ winner, loser }: { winner: string; loser: string }) => {
      setGamesPlayed((prev) => prev + 1);
      if (winner.toLowerCase() === userAddress.toLowerCase())
        setWins((prev) => prev + 1);
      if (loser.toLowerCase() === userAddress.toLowerCase())
        setLosses((prev) => prev + 1);
    });

    return () => {
      s.disconnect();
    };
  }, [userAddress]);

  // ------------------- GESTION DES MOVES -------------------
  const handleMove = (from: Square, to: Square) => {
    const g = gameRef.current;
    const turn = g.turn() === "w" ? "white" : "black";
    if (turn !== playerColor) return;

    const m = g.move({ from, to });
    if (!m) return;

    gameRef.current = g;
    setGame(new Chess(g.fen()));
    setHighlightedSquares([]);

    if (socketRef.current && roomId)
      socketRef.current.emit("move", { from, to, roomId });
  };

  // ------------------- JOIN MATCH AVEC CHECK FUNDS -------------------
  const joinMatch = async () => {
    if (!stake || !isConnected || !userAddress || joining) return;
    setJoining(true);
    try {
      // ✅ Vérifie solde et allowance avant de rejoindre
      const fundCheck = await checkFundsAndAllowance(userAddress, stake);
      if (!fundCheck.ok) {
        alert(fundCheck.reason ?? "Error checking funds");
        return;
      }

      if (fundCheck.approveNeeded) {
        alert(
          `Approval needed for ${stake} USDC. Please approve in your wallet first.`
        );
        return;
      }

      // Requête serveur pour rejoindre un match
      const res = await axios.post(`${API_URL}/join`, {
        address: userAddress,
        stake,
      });
      const { gameId } = res.data as { gameId: string };
      setRoomId(gameId);

      const fresh = new Chess();
      gameRef.current = fresh;
      setGame(new Chess(fresh.fen()));
      setOpponent(null);
      setHighlightedSquares([]);
    } catch (err) {
      console.error("❌ Erreur joinMatch:", err);
    } finally {
      setJoining(false);
    }
  };

  // ------------------- RENDER -------------------
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      {/* HEADER */}
      <header className="border-b border-white/10 backdrop-blur-md bg-gray-900/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="font-extrabold text-2xl text-[#F78A28]">
            ♟️ Web3 Chess
          </h1>
          <ConnectButton />
        </div>
      </header>

      {/* BANNER */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Card glow>
          <div className="flex justify-between flex-wrap gap-2 items-center">
            <Badge color={matchReady ? "green" : "yellow"}>
              {matchReady ? "Match Ready" : "Waiting for opponent"}
            </Badge>
            <Badge color="blue">Stake: {stake ?? 0} USDC</Badge>
            <Badge color="gray">Role: {playerRole ?? "—"}</Badge>
            <Badge color={playerColor === "white" ? "blue" : "green"}>
              You: {playerColor}
            </Badge>
          </div>
        </Card>
      </div>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-12 gap-6 flex-1">
        {/* MATCHMAKING */}
        <section className="lg:col-span-3 space-y-4">
          <Card title="💰 Stake Selection" glow>
            <div className="flex gap-2 flex-wrap">
              {[10, 25, 50].map((amount) => (
                <Chip
                  key={amount}
                  active={stake === amount}
                  onClick={() => setStake(amount)}
                >
                  {amount} USDC
                </Chip>
              ))}
            </div>
            <button
              onClick={joinMatch}
              disabled={!stake || !isConnected || joining}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-lg shadow hover:scale-105 transition-transform"
            >
              {joining ? "Matching…" : "Start Matchmaking"}
            </button>
          </Card>
        </section>

        {/* BOARD */}
        <section className="lg:col-span-6 space-y-4">
          <Card title="♟️ Board" glow>
            {roomId && opponent ? (
              <BoardUI
                board={game.board()}
                highlightedSquares={highlightedSquares}
                handleDrop={handleMove}
                setHighlightedSquares={setHighlightedSquares}
                game={game}
              />
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            )}
          </Card>

          <Card title="📜 Moves History" glow>
            <ol className="text-sm space-y-1 font-mono max-h-40 overflow-y-auto">
              {game.history().map((move, i) => (
                <li key={i}>
                  {i + 1}. {move}
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* DASHBOARD */}
        <section className="lg:col-span-3 space-y-4">
          <Card title="📊 Dashboard" glow>
            <p className="truncate">Your address: {userAddress || "—"}</p>
            <p>Role: {playerRole ?? "—"}</p>
            <p>Stake: {stake ?? "—"} USDC</p>
            <p>Potential gain: {potentialGain ?? "—"} USDC</p>
          </Card>

          <Card title="👤 Player Stats" glow>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Games played</span>
                <span className="font-medium">{gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span>Wins</span>
                <Badge color="green">{wins}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Losses</span>
                <Badge color="red">{losses}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Winrate</span>
                <span className="font-medium">{winrate}%</span>
              </div>
            </div>
          </Card>

          <Card title="⏱ Game Status" glow>
            <p>Turn: {game.turn() === "w" ? "White" : "Black"}</p>
            <p>Last move: {game.history().slice(-1)[0] ?? "—"}</p>
            <p>Opponent: {opponent ?? "Waiting…"}</p>
          </Card>
        </section>
      </main>
    </div>
  );
}
