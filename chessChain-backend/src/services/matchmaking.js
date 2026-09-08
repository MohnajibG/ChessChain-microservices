import Game from "../models/Game.js";

let changeStream = null;

const pipeline = [
  {
    $match: {
      operationType: "update",
      "updateDescription.updatedFields.player2": { $exists: true },
    },
  },
];

async function handleChange(io, change) {
  const gameId = change.documentKey._id;
  const game = await Game.findById(gameId).lean();

  if (!game || !game.roomId) {
    console.warn(`[matchmaking] Game ${gameId} not found or missing roomId`);
    return;
  }

  console.log(
    `🎯 Match: ${game.player1} vs ${game.player2} (stake: ${game.stake})`,
  );

  io.to(game.roomId).emit("matchFound", {
    creator: {
      gameId: game._id.toString(),
      stake: game.stake,
      opponent: game.player2,
      role: "creator",
    },
    joiner: {
      gameId: game._id.toString(),
      stake: game.stake,
      opponent: game.player1,
      role: "joiner",
    },
  });
}

export function initMatchmaking(io) {
  if (changeStream) {
    changeStream.close();
    changeStream = null;
  }

  changeStream = Game.watch(pipeline);

  changeStream.on("change", (change) => handleChange(io, change));

  changeStream.on("error", (err) => {
    console.error("[matchmaking] Stream error:", err.message);
    changeStream.close();
    setTimeout(() => initMatchmaking(io), 5000);
  });

  changeStream.on("close", () => {
    console.warn("[matchmaking] Stream closed — retrying in 5s");
    setTimeout(() => initMatchmaking(io), 5000);
  });

  console.log("[matchmaking] Change stream active");
}

export function stopMatchmaking() {
  changeStream?.close();
  changeStream = null;
}
