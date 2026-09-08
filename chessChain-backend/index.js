import dotenv from "dotenv";
dotenv.config();

import helmet from "helmet";
import rateLimit from "express-rate-limit";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/database.js";
import initSocket from "./src/config/socket.js";
import queueRoutes from "./src/routes/queue.js";
import cors from "cors";

process.on("uncaughtException", (err) => {
  console.error(err);
  process.exit(1);
});
process.on("unhandledRejection", (r) => {
  console.error(r);
  process.exit(1);
});

const PORT = process.env.PORT || 4000;
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

const corsOptions = {
  origin: (origin, cb) =>
    !origin || allowedOrigins.includes(origin)
      ? cb(null, true)
      : cb(new Error("Not allowed by CORS")),
  credentials: true,
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use((req, _, next) => {
  req.io = io;
  next();
});

app.use("/queue", queueRoutes);

await connectDB();
initSocket(io);

server.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`),
);
