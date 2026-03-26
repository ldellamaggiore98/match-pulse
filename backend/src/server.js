import express from "express";
import cors from "cors";
import standingsRoutes from "./routes/standings.routes.js";
import matchesRoutes from "./routes/matches.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/standings", standingsRoutes);
app.use("/matches", matchesRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 MatchPulse API running on port ${PORT}`);
});