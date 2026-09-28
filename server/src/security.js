import helmet from "helmet";
import rateLimit from "express-rate-limit";

// ─── 1. HTTP Security Headers (via Helmet) ──────────────────────────────────
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Disabled by default for SPA + embedded resources, customized if needed
  crossOriginEmbedderPolicy: false,
  xContentTypeOptions: true, // Prevent MIME-type sniffing
  xFrameOptions: { action: "sameorigin" }, // Prevent clickjacking
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
  hidePoweredBy: true, // Hide X-Powered-By: Express
});

// ─── 2. Rate Limiters ────────────────────────────────────────────────────────

// General API Rate Limiter
export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300, // 300 requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Terlalu banyak permintaan ke server. Silakan coba beberapa saat lagi.",
  },
});

// Strict limiter for Login (Brute-force protection)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Terlalu banyak percobaan login gagal. Silakan coba lagi dalam 15 menit.",
  },
});

// Strict limiter for OTP Request (Anti Email-bombing / Spam)
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 OTP requests per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Terlalu banyak permintaan OTP. Tunggu 10 menit sebelum meminta kode baru.",
  },
});

// Public Event Registration Limiter (Bot spam & DoS prevention)
export const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 registrations per 10 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Batas pendaftaran tercapai untuk koneksi Anda. Silakan coba lagi nanti.",
  },
});

// Admin Account Registration Limiter (abuse protection on open admin signup)
export const adminRegisterLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 new admin accounts per 10 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Terlalu banyak percobaan pendaftaran akun. Silakan coba lagi dalam 10 menit.",
  },
});

// Check-in Scanner Limiter (QR flooding protection)
export const checkinLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 scans per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Terlalu banyak pemindaian dalam waktu singkat. Mohon perlambat pemindaian.",
  },
});

// ─── 3. Input Sanitization & CSV Formula Injection Protection ───────────────

/**
 * Neutralizes CSV / Excel Formula Injection (CSV Injection / CWE-1236).
 * Prepends a single quote if a cell starts with formula characters (=, +, -, @, tab, CR).
 */
export function sanitizeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  let s = String(val);
  // Neutralize formula injection
  if (/^[=+\-@\t\r]/.test(s)) {
    s = "'" + s;
  }
  // Escape standard double quotes
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Sanitizes input string and bounds its length.
 */
export function sanitizeString(val, maxLength = 255) {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLength);
}
