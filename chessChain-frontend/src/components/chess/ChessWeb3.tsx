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
  // Le rattrapage de "joinGame" et le change stream Mongo peuvent tous deux
  // émettre matchFound pour la même partie : on ne traite le match qu'une fois
  // (handleMatchFound déclenche une transaction on-chain, jamais deux fois).
  const handledMatchIdRef = useRef<string | null>(null);

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
    const s = io(SOCKET_URL);
    socketRef.current = s;

    s.on("opponentMove", ({ from, to }: MoveEvent) => {
      const g = gameRef.current;
      const m = g.move({ from, to });
      if (!m) return;
      gameRef.current = g;
      setGame(new Chess(g.fen()));
      setHighlightedSquares([]);
    });

    // Match found : source unique de vérité pour rôle / couleur / adversaire
    s.on("matchFound", ({ creator, joiner }) => {
      if (handledMatchIdRef.current === creator.gameId) return; // doublon, déjà traité
      handledMatchIdRef.current = creator.gameId;

      const me = userAddress.toLowerCase();
      if (creator.opponent?.toLowerCase() === me) {
        // Je suis le joiner (player2)
        setPlayerRole("joiner");
        setPlayerColor("black");
        setOpponent(joiner.opponent);
        handleMatchFound({
          gameId: joiner.gameId,
          stake: joiner.stake,
          role: "joiner",
        });
      } else if (joiner.opponent?.toLowerCase() === me) {
        // Je suis le creator (player1)
        setPlayerRole("creator");
        setPlayerColor("white");
        setOpponent(creator.opponent);
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

  // Rejoint la room Socket.IO du match dès que le gameId est connu
  // (nécessaire pour recevoir matchFound/opponentMove).
  useEffect(() => {
    const s = socketRef.current;
    if (s && roomId) {
      s.emit("joinGame", roomId);
    }
  }, [roomId]);

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
      handledMatchIdRef.current = null;

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
    <div className="mx-auto max-w-7xl px-4 pb-16">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Web3 <span className="text-gold-400">Arena</span>
          </h1>
          <p className="text-sm text-zinc-500">
            Stake tokens, play, take the pot.
          </p>
        </div>
        <ConnectButton />
      </div>

      {/* BANNER */}
      <div className="py-4">
        <Card glow>
          <div className="flex justify-between flex-wrap gap-2 items-center">
            <Badge color={matchReady ? "emerald" : "gold"}>
              {matchReady ? "Match Ready" : "Waiting for opponent"}
            </Badge>
            <Badge color="sky">Stake: {stake ?? 0} USDC</Badge>
            <Badge color="zinc">Role: {playerRole ?? "—"}</Badge>
            <Badge color={playerColor === "white" ? "sky" : "zinc"}>
              You: {playerColor}
            </Badge>
          </div>
        </Card>
      </div>

      {/* MAIN */}
      <main className="grid lg:grid-cols-12 gap-6 py-2">
        {/* MATCHMAKING */}
        <section className="lg:col-span-3 space-y-4">
          <Card title="Stake Selection" glow>
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
              className="mt-4 w-full px-4 py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-zinc-950 font-semibold rounded-xl shadow-md shadow-gold-500/20 hover:shadow-gold-500/40 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {joining ? "Matching…" : "Start Matchmaking"}
            </button>
          </Card>
        </section>

        {/* BOARD */}
        <section className="lg:col-span-6 space-y-4">
          <Card title="Board" glow>
            {roomId && opponent ? (
              <div className="flex justify-center">
                <BoardUI
                  board={game.board()}
                  highlightedSquares={highlightedSquares}
                  handleDrop={handleMove}
                  setHighlightedSquares={setHighlightedSquares}
                  game={game}
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            )}
          </Card>

          <Card title="Move History" glow>
            <ol className="text-sm space-y-1 font-mono max-h-40 overflow-y-auto text-zinc-400">
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
          <Card title="Dashboard" glow>
            <div className="space-y-2 text-sm text-zinc-300">
              <p className="truncate">Address: {userAddress || "—"}</p>
              <p>Role: {playerRole ?? "—"}</p>
              <p>Stake: {stake ?? "—"} USDC</p>
              <p>Potential gain: {potentialGain ?? "—"} USDC</p>
            </div>
          </Card>

          <Card title="Player Stats" glow>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Games played</span>
                <span className="font-medium">{gamesPlayed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Wins</span>
                <Badge color="emerald">{wins}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Losses</span>
                <Badge color="rose">{losses}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Winrate</span>
                <span className="font-medium">{winrate}%</span>
              </div>
            </div>
          </Card>

          <Card title="Game Status" glow>
            <div className="space-y-1 text-sm text-zinc-300">
              <p>Turn: {game.turn() === "w" ? "White" : "Black"}</p>
              <p>Last move: {game.history().slice(-1)[0] ?? "—"}</p>
              <p>Opponent: {opponent ?? "Waiting…"}</p>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
