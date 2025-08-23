// backend/controllers/queue.js
export const joinQueue = (req, res) => {
  const { address, stake } = req.body;
  if (!address) {
    return res.status(400).json({ error: "Missing address" });
  }

  console.log(`🎮 Player ${address} joined queue with stake ${stake}`);
  res.json({ success: true, message: "Player added to queue", stake });
};

export const leaveQueue = (req, res) => {
  const { address } = req.body;
  console.log(`👋 Player ${address} left queue`);
  res.json({ success: true, message: "Player removed from queue" });
};
