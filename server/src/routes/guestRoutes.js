import { Router } from "express";
import crypto from "node:crypto";
import { db } from "../db.js";
import { notificationService } from "../notifications/notificationService.js";

const router = Router();

// Generate short readable unique ticket code, e.g., TKT-7K9M2P
function generateTicketCode(prefix = "TKT") {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused chars (0, O, 1, I)
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

// Guest registration endpoint
router.post("/events/:slug/register", async (req, res) => {
  const { slug } = req.params;
  const { name, whatsapp, email, organization } = req.body;

  // Validation: 4 mandatory fields
  if (!name?.trim()) {
    return res.status(400).json({ error: "Nama Lengkap wajib diisi." });
  }
  if (!whatsapp?.trim()) {
    return res.status(400).json({ error: "Nomor WhatsApp wajib diisi." });
  }
  if (!email?.trim()) {
    return res.status(400).json({ error: "Email wajib diisi." });
  }
  if (!organization?.trim()) {
    return res.status(400).json({ error: "Instansi / Organisasi wajib diisi." });
  }

  const event = db.prepare("SELECT * FROM events WHERE slug = ?").get(slug);
  if (!event) {
    return res.status(404).json({ error: "Acara tidak ditemukan." });
  }

  if (event.status !== "ACTIVE") {
    return res.status(400).json({ error: "Pendaftaran untuk acara ini sedang ditutup." });
  }

  // Check capacity if set
  if (event.capacity > 0) {
    const countRow = db.prepare("SELECT COUNT(*) as total FROM participants WHERE event_id = ?").get(event.id);
    if (countRow && countRow.total >= event.capacity) {
      return res.status(400).json({ error: "Mohon maaf, kuota pendaftaran untuk acara ini sudah penuh." });
    }
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

  const cleanName = name.trim();
  const cleanWhatsapp = whatsapp.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanOrg = organization.trim();

  try {
    const insertStmt = db.prepare(`
      INSERT INTO participants (event_id, ticket_code, name, whatsapp, email, organization, checked_in)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);

    const result = insertStmt.run(event.id, ticketCode, cleanName, cleanWhatsapp, cleanEmail, cleanOrg);
    const participantId = Number(result.lastInsertRowid);

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
    SELECT p.*, e.title as event_title, e.slug as event_slug, e.date as event_date, e.time as event_time, e.location as event_location, e.description as event_description
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
    },
  });
});

export default router;
