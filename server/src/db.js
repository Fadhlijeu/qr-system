import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "events.db");
export const db = new DatabaseSync(dbPath);

// Initialize schema
export function initDatabase() {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      location TEXT,
      date TEXT NOT NULL,
      time TEXT,
      capacity INTEGER DEFAULT 0,
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      ticket_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT NOT NULL,
      organization TEXT NOT NULL,
      checked_in INTEGER DEFAULT 0,
      checked_in_at TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_participants_ticket_code ON participants(ticket_code);
    CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // Seed default admin if not exists
  const existingAdmin = db.prepare("SELECT id FROM admins WHERE email = ?").get("fadhli@gmail.com");
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("GrandOpening2026!", salt);
    db.prepare("INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)").run(
      "fadhli@gmail.com",
      hash,
      "Fadhli (Admin)"
    );
    console.log("✅ Seeded default admin: fadhli@gmail.com");
  }

  // Seed default event if not exists
  const existingEvent = db.prepare("SELECT id FROM events WHERE slug = ?").get("grand-opening");
  if (!existingEvent) {
    db.prepare(`
      INSERT INTO events (title, slug, description, location, date, time, capacity, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "Grand Opening",
      "grand-opening",
      "Selamat datang di acara Grand Opening! Daftarkan dirimu dan dapatkan e-ticket QR resmi untuk hadir.",
      "Grand Ballroom, Lantai 3, Jakarta Pusat",
      "2026-10-15",
      "09:00 - 17:00 WIB",
      500,
      "ACTIVE"
    );
    console.log("✅ Seeded default event: Grand Opening (/e/grand-opening)");
  }
}
