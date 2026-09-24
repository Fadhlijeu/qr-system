import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { signToken, requireAdmin } from "../auth.js";

const router = Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email.trim().toLowerCase());
  if (!admin) {
    return res.status(401).json({ error: "Email atau password salah." });
  }

  const isMatch = bcrypt.compareSync(password, admin.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: "Email atau password salah." });
  }

  const token = signToken({ id: admin.id, email: admin.email, name: admin.name });
  res.json({
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  });
});

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: "Nama, email, dan kata sandi wajib diisi." });
  }

  if (password.trim().length < 6) {
    return res.status(400).json({ error: "Kata sandi minimal 6 karakter." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(cleanEmail);
  if (existing) {
    return res.status(400).json({ error: "Email sudah terdaftar. Silakan gunakan email lain atau login." });
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password.trim(), salt);

  const result = db.prepare("INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)").run(
    name.trim(),
    cleanEmail,
    hash
  );

  const adminId = Number(result.lastInsertRowid);
  const admin = db.prepare("SELECT id, name, email FROM admins WHERE id = ?").get(adminId);

  const token = signToken({ id: admin.id, email: admin.email, name: admin.name });
  res.status(201).json({
    token,
    admin,
    message: "Pendaftaran akun admin berhasil!",
  });
});

router.get("/me", requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

export default router;
