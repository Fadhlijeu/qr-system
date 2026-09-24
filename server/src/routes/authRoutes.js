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

router.get("/me", requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

export default router;
