import { initMatchmaking } from "../services/matchmaking.js";

const initSocket = (io) => {
  // Initialisation du matchmaking
  initMatchmaking(io);

  io.on("connection", (socket) => {
    console.log("🔗 Nouveau joueur:", socket.id);

    socket.on("joinGame", (roomId) => {
      socket.join(roomId);
      const clients = io.sockets.adapter.rooms.get(roomId);

      if (clients && clients.size === 1) {
        // Premier joueur = creator
        socket.emit("assignRole", "creator");
      } else if (clients && clients.size === 2) {
        // Deuxième joueur = joiner
        socket.emit("assignRole", "joiner");
        // Notifier les deux joueurs que la partie peut commencer
        io.to(roomId).emit("gameStart", { roomId });
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
