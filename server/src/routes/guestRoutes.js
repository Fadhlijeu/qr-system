import { Router } from "express";
import crypto from "node:crypto";
import { db } from "../db.js";
import { notificationService } from "../notifications/notificationService.js";
import { registerLimiter, sanitizeString } from "../security.js";

const router = Router();

// Public: list active events (used by the guest page when no slug is given)
router.get("/events", (req, res) => {
  const events = db.prepare(`
    SELECT e.id, e.title, e.slug, e.description, e.location, e.date, e.time, e.image_url, e.lat, e.lng
    FROM events e
    WHERE status = 'ACTIVE'
    ORDER BY created_at DESC
  `).all();

  res.json({ events });
});

// Generate human-friendly unique ticket code, e.g., TKT-7K9M2P
function generateTicketCode(prefix = "TKT") {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // clean unambiguous characters (no 0/O, 1/I)
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

// Get public event details for registration form
router.get("/events/:slug", (req, res) => {
  const { slug } = req.params;
  const event = db.prepare("SELECT * FROM events WHERE slug = ?").get(slug);

  if (!event) {
    return res.status(404).json({ error: "Acara tidak ditemukan atau tautan salah." });
  }

  // Count current registrations
  const countRow = db.prepare("SELECT COUNT(*) as total FROM participants WHERE event_id = ?").get(event.id);
  const totalRegistered = countRow ? countRow.total : 0;
  const isFull = event.capacity > 0 && totalRegistered >= event.capacity;

  res.json({
    event: {
      ...event,
      total_registered: totalRegistered,
      is_full: isFull,
      remaining_slots: event.capacity > 0 ? Math.max(0, event.capacity - totalRegistered) : null,
    },
  });
});

// Guest registration endpoint (with rate limiter to prevent bot spam)
router.post("/events/:slug/register", registerLimiter, async (req, res) => {
  const { slug } = req.params;
  const { name, whatsapp, email, organization } = req.body;

  // Validation: 4 mandatory fields with strict bounds
  const cleanName = sanitizeString(name, 100);
  const cleanWhatsapp = sanitizeString(whatsapp, 30);
  const cleanEmail = sanitizeString(email, 150).toLowerCase();
  const cleanOrg = sanitizeString(organization, 150);

  if (!cleanName) {
    return res.status(400).json({ error: "Nama Lengkap wajib diisi (maksimal 100 karakter)." });
  }
  if (!cleanWhatsapp || !/^[0-9+\-\s()]{7,30}$/.test(cleanWhatsapp)) {
    return res.status(400).json({ error: "Nomor WhatsApp tidak valid (minimal 7 digit)." });
  }
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: "Format email tidak valid." });
  }
  if (!cleanOrg) {
    return res.status(400).json({ error: "Instansi / Organisasi wajib diisi (maksimal 150 karakter)." });
  }

  const event = db.prepare("SELECT * FROM events WHERE slug = ?").get(slug);
  if (!event) {
    return res.status(404).json({ error: "Acara tidak ditemukan." });
  }

  if (event.status !== "ACTIVE") {
    return res.status(400).json({ error: "Pendaftaran untuk acara ini sedang ditutup." });
  }

  // Generate unique ticket code
  let ticketCode = "";
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 10) {
    ticketCode = generateTicketCode("TKT");
    const found = db.prepare("SELECT id FROM participants WHERE ticket_code = ?").get(ticketCode);
    if (!found) exists = false;
    attempts++;
  }

  // Atomic capacity check and insertion to prevent race condition overbooking
  db.exec("BEGIN IMMEDIATE");
  let participantId = null;
  try {
    if (event.capacity > 0) {
      const countRow = db.prepare("SELECT COUNT(*) as total FROM participants WHERE event_id = ?").get(event.id);
      if (countRow && countRow.total >= event.capacity) {
        db.exec("ROLLBACK");
        return res.status(400).json({ error: "Mohon maaf, kuota pendaftaran untuk acara ini sudah penuh." });
      }
    }

    const insertStmt = db.prepare(`
      INSERT INTO participants (event_id, ticket_code, name, whatsapp, email, organization, checked_in)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);

    const result = insertStmt.run(event.id, ticketCode, cleanName, cleanWhatsapp, cleanEmail, cleanOrg);
    participantId = Number(result.lastInsertRowid);
    db.exec("COMMIT");
  } catch (err) {
    try {
      db.exec("ROLLBACK");
    } catch (_) {}
    console.error("Registration transaction error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan sistem saat mendaftar. Silakan coba lagi." });
  }

  try {
    const participant = db.prepare("SELECT * FROM participants WHERE id = ?").get(participantId);

    // Asynchronous notification (non-blocking)
    notificationService.notifyRegistration(participant, event).catch((err) => {
      console.error("Notification dispatch error:", err);
    });

    return res.status(201).json({
      success: true,
      message: "Pendaftaran berhasil! E-ticket QR Anda telah dibuat.",
      participant,
      event: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        date: event.date,
        time: event.time,
        location: event.location,
        description: event.description,
        image_url: event.image_url,
        lat: event.lat,
        lng: event.lng,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan sistem saat mendaftar. Silakan coba lagi." });
  }
});

// Get e-ticket data by ticketCode
router.get("/tickets/:ticketCode", (req, res) => {
  const { ticketCode } = req.params;
  const participant = db.prepare(`
    SELECT p.*, e.title as event_title, e.slug as event_slug, e.date as event_date, e.time as event_time, e.location as event_location, e.description as event_description,
      e.image_url as event_image_url, e.lat as event_lat, e.lng as event_lng
    FROM participants p
    JOIN events e ON p.event_id = e.id
    WHERE p.ticket_code = ?
  `).get(ticketCode.trim().toUpperCase());

  if (!participant) {
    return res.status(404).json({ error: "E-Ticket tidak ditemukan atau kode tiket salah." });
  }

  res.json({
    ticket: {
      ticket_code: participant.ticket_code,
      name: participant.name,
      whatsapp: participant.whatsapp,
      email: participant.email,
      organization: participant.organization,
      checked_in: Boolean(participant.checked_in),
      checked_in_at: participant.checked_in_at,
      created_at: participant.created_at,
    },
    event: {
      title: participant.event_title,
      slug: participant.event_slug,
      date: participant.event_date,
      time: participant.event_time,
      location: participant.event_location,
      description: participant.event_description,
      image_url: participant.event_image_url,
      lat: participant.event_lat,
      lng: participant.event_lng,
    },
  });
});

export default router;
