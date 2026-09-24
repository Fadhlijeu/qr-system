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
// Larger limit so admins can upload a small event image as a base64 data URL
app.use(express.json({ limit: "4mb" }));

// Initialize Database (WAL mode, tables & initial seeds)
initDatabase();

// Optional Multi-domain segregation middleware
app.use((req, res, next) => {
  const host = (req.get("host") || "").toLowerCase().split(":")[0];
  const adminDomain = (process.env.ADMIN_DOMAIN || "").toLowerCase().replace(/^https?:\/\//, "").split(":")[0];
  const guestDomain = (process.env.GUEST_DOMAIN || "").toLowerCase().replace(/^https?:\/\//, "").split(":")[0];

  // If Guest Domain is configured and request comes from Guest Domain, block /admin access
  if (guestDomain && host === guestDomain && (req.path.startsWith("/admin") || req.path.startsWith("/api/admin"))) {
    return res.status(404).json({ error: "Halaman tidak ditemukan." });
  }

  // If Admin Domain is configured and root / is accessed, redirect to /admin
  if (adminDomain && host === adminDomain && req.path === "/") {
    return res.redirect("/admin");
  }

  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", guestRoutes);
app.use("/api/admin", adminRoutes);

// Config endpoint for client domain resolution
app.get("/api/config", (req, res) => {
  const host = req.get("host");
  const protocol = req.protocol;
  const currentOrigin = `${protocol}://${host}`;

  res.json({
    currentOrigin,
    guestDomain: process.env.GUEST_DOMAIN || currentOrigin,
    adminDomain: process.env.ADMIN_DOMAIN || currentOrigin,
    // Google Maps JavaScript API key (Places + Maps). Empty when not configured,
    // which makes the client fall back to the manual/embed map picker.
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  });
});

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
