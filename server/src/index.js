import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { initDatabase } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import guestRoutes from "./routes/guestRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { securityHeaders, apiLimiter } from "./security.js";
import { isAdminOtpRegistrationEnabled } from "./features.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Also support an `.env` placed next to the server package (server/.env) so the
// feature flags work no matter which directory the process is started from.
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers (Helmet: HSTS, X-Frame-Options, X-Content-Type-Options, etc.)
app.use(securityHeaders);

// CORS configuration (controlled origins)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server) or matching origin
      if (!origin || !allowedOrigins || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }
      return callback(new Error("Akses CORS ditolak oleh kebijakan keamanan."));
    },
    credentials: true,
  })
);

// Body parsing with safe size limit
app.use(express.json({ limit: "4mb" }));

// Rate limiting on all /api endpoints
app.use("/api/", apiLimiter);

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
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
    // Feature flags — see server/src/features.js
    adminOtpRegistrationEnabled: isAdminOtpRegistrationEnabled(),
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Centralized error handler to prevent stack trace leaks
app.use("/api", (err, req, res, next) => {
  console.error("❌ API Error:", err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Terjadi kesalahan pada server." : err.message,
  });
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
  console.log(`📡 URL: http://localhost:${PORT}\n`);
});

