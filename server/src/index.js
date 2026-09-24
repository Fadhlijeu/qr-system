import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { initDatabase } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import guestRoutes from "./routes/guestRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database (WAL mode, tables & initial seeds)
initDatabase();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", guestRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Serve frontend build in production if client/dist exists
const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  const indexHtml = path.join(clientDist, "index.html");
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(200).send("API Server is running on port " + PORT + ". Client is in development mode.");
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 [Server] Minimal QR Event Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`👤 Default Admin: fadhli@gmail.com | Password: GrandOpening2026!\n`);
});
