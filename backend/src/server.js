import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import standingsRoutes from "./routes/standings.routes.js";
import matchesRoutes from "./routes/matches.routes.js";
import { startScheduler } from "./scheduler.js";

const app = express();
const httpServer = createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "*";

export const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL }
});

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.use("/standings", standingsRoutes);
app.use("/matches", matchesRoutes);

io.on("connection", (socket) => {
  console.log(`[ws] Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`[ws] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 MatchPulse API running on port ${PORT}`);
  startScheduler();
});
