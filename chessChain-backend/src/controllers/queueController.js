import Game from "../models/Game.js";

const ALLOWED_STAKES = [10, 25, 50];

export const joinQueue = async (req, res) => {
  const { address, stake } = req.body;
  const stakeAmount = Number(stake);

  if (!address) {
    return res.status(400).json({ error: "Missing address" });
  }
  if (!ALLOWED_STAKES.includes(stakeAmount)) {
    return res.status(400).json({ error: "Invalid stake amount" });
  }

  try {
    // Déjà dans une partie (en attente ou appariée) -> on renvoie la même (reconnexion)
    const existing = await Game.findOne({
      status: { $in: ["waiting", "ready"] },
      $or: [{ player1: address }, { player2: address }],
    });
    if (existing) {
      console.log(`♻️ Player ${address} already in game ${existing._id}`);
      return res.json({
        success: true,
        gameId: existing._id.toString(),
        status: existing.status,
      });
    }

    // Tente d'apparier avec une partie en attente au même montant (opération atomique)
    const matched = await Game.findOneAndUpdate(
      { status: "waiting", stake: stakeAmount, player1: { $ne: address } },
      { $set: { player2: address, status: "ready" } },
      { new: true }
    );

    if (matched) {
      console.log(
        `🎯 Player ${address} matched into game ${matched._id} (stake ${stakeAmount})`
      );
      return res.json({
        success: true,
        gameId: matched._id.toString(),
        status: "ready",
      });
    }

    // Aucun adversaire disponible -> ouvre une nouvelle partie en attente
    const game = await Game.create({ player1: address, stake: stakeAmount });
    console.log(
      `🕐 Player ${address} opened game ${game._id} (stake ${stakeAmount})`
    );
    return res.json({
      success: true,
      gameId: game._id.toString(),
      status: "waiting",
    });
  } catch (err) {
    console.error("❌ joinQueue error:", err);
    return res.status(500).json({ error: "Failed to join queue" });
  }
};

export const leaveQueue = async (req, res) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: "Missing address" });
  }

  try {
    const { deletedCount } = await Game.deleteOne({
      player1: address,
      status: "waiting",
    });
    console.log(
      `👋 Player ${address} left queue (removed: ${deletedCount > 0})`
    );
    res.json({ success: true, message: "Player removed from queue" });
  } catch (err) {
    console.error("❌ leaveQueue error:", err);
    res.status(500).json({ error: "Failed to leave queue" });
  }
};
