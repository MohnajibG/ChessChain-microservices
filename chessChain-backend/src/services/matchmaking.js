import Game from "../models/Game.js";

export function initMatchmaking(io) {
  // ⚠️ Nécessite Mongo en replica set (même en local)
  // mongod --replSet rs0  (puis rs.initiate() dans le shell)
  Game.watch().on("change", async (change) => {
    if (
      change.operationType === "update" &&
      change.updateDescription?.updatedFields?.player2
    ) {
      const gameId = change.documentKey._id;
      const game = await Game.findById(gameId);
      if (!game) return;

      console.log(
        `🎯 Match: ${game.player1} vs ${game.player2} (stake ${game.stake})`
      );

      // Notifie tous les sockets dans la room
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
  });
}
