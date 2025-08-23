import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/database.js";
import initSocket from "./src/config/socket.js";
import queueRoutes from "./src/routes/queue.js";
import cors from "cors";

const PORT = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
// Middleware
app.use(express.json());

// API routes
app.use("/queue", queueRoutes);

// Connexion DB
connectDB();

// Initialisation socket.io
initSocket(io);

// Lancement serveur
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
