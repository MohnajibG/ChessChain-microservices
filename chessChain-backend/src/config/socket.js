import { buildMatchFoundPayload, initMatchmaking } from "../services/matchmaking.js";
import Game from "../models/Game.js";

const initSocket = (io) => {
  // Initialisation du matchmaking
  initMatchmaking(io);

  io.on("connection", (socket) => {
    console.log("🔗 Nouveau joueur:", socket.id);

    socket.on("joinGame", async (roomId) => {
      socket.join(roomId);

      try {
        const game = await Game.findById(roomId).lean();
        if (game?.player2) {
          // Rattrapage : le match était déjà formé avant que ce socket
          // ne rejoigne la room (évite de rater l'événement matchFound).
          socket.emit("matchFound", buildMatchFoundPayload(game));
        }
      } catch (err) {
        console.error("[socket] joinGame lookup error:", err.message);
      }
    });

    socket.on("move", ({ from, to, roomId }) => {
      socket.to(roomId).emit("opponentMove", { from, to });
    });

    socket.on("disconnect", () => {
      console.log("❌ Joueur déconnecté:", socket.id);
    });
  });
};

export default initSocket;
