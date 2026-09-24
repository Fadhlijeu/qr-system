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
      image_url TEXT,
      lat REAL,
      lng REAL,
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

    CREATE TABLE IF NOT EXISTS saved_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      name TEXT NOT NULL,
      address TEXT,
      lat REAL,
      lng REAL,
      capacity INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS organizer_settings (
      admin_id INTEGER PRIMARY KEY,
      name TEXT,
      bio TEXT,
      logo_url TEXT,
      cover_url TEXT,
      accent_color TEXT DEFAULT '#8b5cf6',
      bg_color TEXT DEFAULT '#f8fafc',
      color_mode TEXT DEFAULT 'light',
      font_family TEXT DEFAULT 'Outfit',
      social_instagram TEXT,
      social_website TEXT,
      social_linkedin TEXT,
      social_twitter TEXT,
      email_template TEXT,
      seo_title TEXT,
      seo_description TEXT,
      is_published INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
    );
  `);

  // Safe migration for admin_id in events
  try {
    db.exec(`ALTER TABLE events ADD COLUMN admin_id INTEGER REFERENCES admins (id) ON DELETE SET NULL;`);
  } catch (err) {
    // Column already exists, ignore
  }

  // Safe migration for event display image (optional, may be empty)
  try {
    db.exec(`ALTER TABLE events ADD COLUMN image_url TEXT;`);
  } catch (err) {
    // Column already exists, ignore
  }

  // Safe migration for picked map coordinates (optional, may be empty)
  try {
    db.exec(`ALTER TABLE events ADD COLUMN lat REAL;`);
  } catch (err) {
    // Column already exists, ignore
  }
  try {
    db.exec(`ALTER TABLE events ADD COLUMN lng REAL;`);
  } catch (err) {
    // Column already exists, ignore
  }

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

  // Note: No dummy events or participants are seeded by default.
  // Admins create their own real events and receive real guest registrations.
}
