import { Router } from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { db } from "../db.js";
import { signToken, requireAdmin } from "../auth.js";
import { loginLimiter, otpLimiter } from "../security.js";
import { isAdminOtpRegistrationEnabled } from "../features.js";

const router = Router();

// Message returned while the OTP registration feature flag is off.
const OTP_DISABLED_MESSAGE =
  "Pendaftaran akun admin lewat OTP email sedang dinonaktifkan sementara. Hubungi pengelola sistem untuk pembuatan akun.";

// ─── In-memory OTP store ─────────────────────────────────────────────────────
// { email → { code, expiresAt, name, password_hash } }
const otpStore = new Map();

// Cleanup expired OTPs every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) otpStore.delete(email);
  }
}, 15 * 60 * 1000);

// ─── Nodemailer transporter ───────────────────────────────────────────────────
function createTransporter() {
  // Support any SMTP provider via .env
  // Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
  // Optional: SMTP_FROM (defaults to SMTP_USER)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // SMTP not configured
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
}

async function sendOtpEmail(email, name, code) {
  const transporter = createTransporter();
  if (!transporter) {
    // Dev mode: log OTP to console
    console.log(`\n📧 [OTP DEV MODE] Email: ${email} | OTP: ${code} | Name: ${name}\n`);
    return;
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await transporter.sendMail({
    from: `"QR Check-in" <${from}>`,
    to: email,
    subject: "Kode Verifikasi Pendaftaran Admin",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b;margin-bottom:8px">Verifikasi Email</h2>
        <p style="color:#475569">Halo <strong>${name}</strong>,</p>
        <p style="color:#475569">Gunakan kode OTP berikut untuk menyelesaikan pendaftaran akun admin:</p>
        <div style="background:#f1f5f9;border-radius:10px;padding:24px;text-align:center;margin:20px 0">
          <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#3b82f6">${code}</span>
        </div>
        <p style="color:#94a3b8;font-size:13px">Kode ini berlaku selama <strong>10 menit</strong>. Jangan bagikan kepada siapapun.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
        <p style="color:#cbd5e1;font-size:11px">Sistem Registrasi & E-Ticket Acara</p>
      </div>
    `,
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /auth/login (with brute-force rate limiter)
router.post("/login", loginLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  const cleanEmail = String(email).trim().toLowerCase().slice(0, 150);
  const cleanPassword = String(password).slice(0, 128);

  const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(cleanEmail);
  if (!admin) {
    return res.status(401).json({ error: "Email atau password salah." });
  }

  const isMatch = bcrypt.compareSync(cleanPassword, admin.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: "Email atau password salah." });
  }

  const token = signToken({ id: admin.id, email: admin.email, name: admin.name });
  res.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  });
});

// POST /auth/register/request-otp — Step 1: validate & send OTP (with anti-spam rate limiter)
router.post("/register/request-otp", otpLimiter, async (req, res) => {
  // Feature flag: OTP e-mail registration is temporarily disabled (code kept).
  if (!isAdminOtpRegistrationEnabled()) {
    return res.status(403).json({ error: OTP_DISABLED_MESSAGE, code: "ADMIN_OTP_REGISTRATION_DISABLED" });
  }

  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: "Nama, email, dan kata sandi wajib diisi." });
  }
  if (password.trim().length < 8) {
    return res.status(400).json({ error: "Kata sandi minimal 8 karakter." });
  }
  if (name.trim().length > 100) {
    return res.status(400).json({ error: "Nama maksimal 100 karakter." });
  }

  const cleanEmail = email.trim().toLowerCase().slice(0, 150);

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: "Format email tidak valid." });
  }

  // Check if email already registered
  const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(cleanEmail);
  if (existing) {
    return res.status(400).json({ error: "Email sudah terdaftar. Silakan login." });
  }

  // Generate 6-digit OTP
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password.trim(), salt);

  otpStore.set(cleanEmail, {
    code,
    name: name.trim(),
    password_hash,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  });

  try {
    await sendOtpEmail(cleanEmail, name.trim(), code);
    res.json({
      success: true,
      message: "Kode OTP dikirim ke email Anda. Berlaku 10 menit.",
      devMode: !process.env.SMTP_HOST,
    });
  } catch (err) {
    console.error("Failed to send OTP email:", err.message);
    return res.status(500).json({ error: "Gagal mengirim email. Periksa konfigurasi SMTP." });
  }
});

// POST /auth/register/verify-otp — Step 2: verify OTP & create account
router.post("/register/verify-otp", (req, res) => {
  // Feature flag: OTP e-mail registration is temporarily disabled (code kept).
  if (!isAdminOtpRegistrationEnabled()) {
    return res.status(403).json({ error: OTP_DISABLED_MESSAGE, code: "ADMIN_OTP_REGISTRATION_DISABLED" });
  }

  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email dan OTP wajib diisi." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const entry = otpStore.get(cleanEmail);

  if (!entry) {
    return res.status(400).json({ error: "OTP tidak ditemukan atau sudah kadaluarsa. Ulangi pendaftaran." });
  }
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(cleanEmail);
    return res.status(400).json({ error: "OTP sudah kadaluarsa. Silakan minta OTP baru." });
  }

  // Max 5 attempts
  entry.attempts = (entry.attempts || 0) + 1;
  if (entry.attempts > 5) {
    otpStore.delete(cleanEmail);
    return res.status(400).json({ error: "Terlalu banyak percobaan. Silakan minta OTP baru." });
  }

  if (String(otp).trim() !== entry.code) {
    return res.status(400).json({
      error: `Kode OTP salah. Sisa percobaan: ${5 - entry.attempts}.`,
    });
  }

  // OTP valid — check if email wasn't registered in the meantime
  const alreadyExists = db.prepare("SELECT id FROM admins WHERE email = ?").get(cleanEmail);
  if (alreadyExists) {
    otpStore.delete(cleanEmail);
    return res.status(400).json({ error: "Email sudah terdaftar." });
  }

  const result = db.prepare("INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)").run(
    entry.name,
    cleanEmail,
    entry.password_hash
  );

  otpStore.delete(cleanEmail);

  const adminId = Number(result.lastInsertRowid);
  const admin = db.prepare("SELECT id, name, email FROM admins WHERE id = ?").get(adminId);
  const token = signToken({ id: admin.id, email: admin.email, name: admin.name });

  res.status(201).json({
    token,
    admin,
    message: "Akun berhasil dibuat!",
  });
});

// GET /auth/me
router.get("/me", requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

export default router;
