import { Router } from "express";
import { db } from "../db.js";
import { requireAdmin } from "../auth.js";

const router = Router();
router.use(requireAdmin);

// Helper to extract clean ticket code from scanned string/URL
function extractTicketCode(raw) {
  if (!raw) return "";
  const str = String(raw).trim();
  // Check if string contains /t/ or /tickets/
  const urlMatch = str.match(/(?:\/t\/|\/tickets\/|\/ticket\/|^)([A-Za-z0-9_-]+)/);
  if (urlMatch && urlMatch[1]) {
    // If it looks like a URL, grab the last segment
    const parts = str.split("/");
    const last = parts[parts.length - 1].split("?")[0].trim();
    if (last) return last.toUpperCase();
  }
  return str.toUpperCase();
}

// 1. List events belonging to logged in admin
router.get("/events", (req, res) => {
  const adminId = req.admin?.id;
  const events = db.prepare(`
    SELECT e.*, 
      (SELECT COUNT(*) FROM participants WHERE event_id = e.id) as total_registered,
      (SELECT COUNT(*) FROM participants WHERE event_id = e.id AND checked_in = 1) as total_checked_in
    FROM events e
    WHERE e.admin_id = ? OR e.admin_id IS NULL
    ORDER BY e.created_at DESC
  `).all(adminId || 0);

  res.json({ events });
});

// 2. Create Event
router.post("/events", (req, res) => {
  const adminId = req.admin?.id;
  const { title, slug, description, location, date, time, capacity, status } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: "Judul acara wajib diisi." });
  }
  if (!date?.trim()) {
    return res.status(400).json({ error: "Tanggal acara wajib diisi." });
  }

  // Generate slug if not provided, or sanitize provided slug
  let cleanSlug = (slug || title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!cleanSlug) cleanSlug = "event-" + Date.now().toString(36);

  // Check unique slug
  const existing = db.prepare("SELECT id FROM events WHERE slug = ?").get(cleanSlug);
  if (existing) {
    cleanSlug = `${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const result = db.prepare(`
    INSERT INTO events (admin_id, title, slug, description, location, date, time, capacity, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    adminId || null,
    title.trim(),
    cleanSlug,
    description?.trim() || "",
    location?.trim() || "",
    date.trim(),
    time?.trim() || "",
    Number(capacity) || 0,
    status || "ACTIVE"
  );

  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(Number(result.lastInsertRowid));
  res.status(201).json({ event });
});

// 3. Update Event
router.put("/events/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, location, date, time, capacity, status } = req.body;

  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(id);
  if (!event) {
    return res.status(404).json({ error: "Acara tidak ditemukan." });
  }

  db.prepare(`
    UPDATE events
    SET title = ?, description = ?, location = ?, date = ?, time = ?, capacity = ?, status = ?, updated_at = datetime('now', 'localtime')
    WHERE id = ?
  `).run(
    title?.trim() || event.title,
    description !== undefined ? description.trim() : event.description,
    location !== undefined ? location.trim() : event.location,
    date?.trim() || event.date,
    time !== undefined ? time.trim() : event.time,
    capacity !== undefined ? Number(capacity) : event.capacity,
    status || event.status,
    id
  );

  const updated = db.prepare("SELECT * FROM events WHERE id = ?").get(id);
  res.json({ event: updated });
});

// 4. Dashboard Metrics for an event
router.get("/events/:id/dashboard", (req, res) => {
  const { id } = req.params;
  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(id);
  if (!event) {
    return res.status(404).json({ error: "Acara tidak ditemukan." });
  }

  const regRow = db.prepare("SELECT COUNT(*) as count FROM participants WHERE event_id = ?").get(id);
  const checkinRow = db.prepare("SELECT COUNT(*) as count FROM participants WHERE event_id = ? AND checked_in = 1").get(id);

  const registered = regRow ? regRow.count : 0;
  const checkedIn = checkinRow ? checkinRow.count : 0;
  const notCheckedIn = Math.max(0, registered - checkedIn);
  const attendanceRate = registered > 0 ? Math.round((checkedIn / registered) * 100) : 0;

  // Recent 10 check-ins
  const recentCheckins = db.prepare(`
    SELECT id, ticket_code, name, organization, whatsapp, email, checked_in_at
    FROM participants
    WHERE event_id = ? AND checked_in = 1
    ORDER BY checked_in_at DESC
    LIMIT 10
  `).all(id);

  res.json({
    event,
    metrics: {
      registered,
      checked_in: checkedIn,
      not_checked_in: notCheckedIn,
      attendance_percentage: attendanceRate,
    },
    recent_checkins: recentCheckins,
  });
});

// 5. Participants list with Search & Filter
router.get("/events/:id/participants", (req, res) => {
  const { id } = req.params;
  const { search, status } = req.query;

  let query = "SELECT * FROM participants WHERE event_id = ?";
  const params = [id];

  if (status === "checked_in") {
    query += " AND checked_in = 1";
  } else if (status === "not_checked_in") {
    query += " AND checked_in = 0";
  }

  if (search?.trim()) {
    const s = `%${search.trim().toLowerCase()}%`;
    query += " AND (LOWER(name) LIKE ? OR LOWER(whatsapp) LIKE ? OR LOWER(email) LIKE ? OR LOWER(organization) LIKE ? OR LOWER(ticket_code) LIKE ?)";
    params.push(s, s, s, s, s);
  }

  query += " ORDER BY id DESC";

  const participants = db.prepare(query).all(...params);
  res.json({ participants, total: participants.length });
});

// 6. Manual Check-in toggle
router.post("/participants/:id/toggle-checkin", (req, res) => {
  const { id } = req.params;
  const participant = db.prepare("SELECT * FROM participants WHERE id = ?").get(id);

  if (!participant) {
    return res.status(404).json({ error: "Peserta tidak ditemukan." });
  }

  const newStatus = participant.checked_in ? 0 : 1;
  const checkedInAt = newStatus === 1 ? new Date().toISOString().replace("T", " ").substring(0, 19) : null;

  db.prepare("UPDATE participants SET checked_in = ?, checked_in_at = ? WHERE id = ?").run(
    newStatus,
    checkedInAt,
    id
  );

  const updated = db.prepare("SELECT * FROM participants WHERE id = ?").get(id);
  res.json({ participant: updated });
});

// 7. QR SCANNER CHECK-IN ENDPOINT
router.post("/check-in", (req, res) => {
  const { code, event_id } = req.body;
  if (!code) {
    return res.status(400).json({ status: "INVALID", message: "Kode QR tidak boleh kosong." });
  }

  const cleanCode = extractTicketCode(code);

  let query = "SELECT p.*, e.title as event_title FROM participants p JOIN events e ON p.event_id = e.id WHERE p.ticket_code = ?";
  const params = [cleanCode];

  if (event_id) {
    query += " AND p.event_id = ?";
    params.push(event_id);
  }

  const participant = db.prepare(query).get(...params);

  // 1. Invalid QR
  if (!participant) {
    return res.json({
      status: "INVALID",
      code: cleanCode,
      message: "INVALID QR: Tiket tidak terdaftar atau tidak sesuai dengan acara ini.",
    });
  }

  // 2. Already Checked In
  if (participant.checked_in === 1) {
    return res.json({
      status: "ALREADY_CHECKED_IN",
      message: "ALREADY CHECKED IN: Peserta sudah melakukan check-in sebelumnya.",
      participant: {
        id: participant.id,
        ticket_code: participant.ticket_code,
        name: participant.name,
        organization: participant.organization,
        whatsapp: participant.whatsapp,
        email: participant.email,
        checked_in_at: participant.checked_in_at,
      },
    });
  }

  // 3. Success Check-In
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  db.prepare("UPDATE participants SET checked_in = 1, checked_in_at = ? WHERE id = ?").run(now, participant.id);

  const updated = db.prepare("SELECT * FROM participants WHERE id = ?").get(participant.id);

  return res.json({
    status: "SUCCESS",
    message: "CHECK-IN SUCCESS: Selamat datang!",
    participant: {
      id: updated.id,
      ticket_code: updated.ticket_code,
      name: updated.name,
      organization: updated.organization,
      whatsapp: updated.whatsapp,
      email: updated.email,
      checked_in_at: updated.checked_in_at,
    },
  });
});

// 8. CSV Export
router.get("/events/:id/export", (req, res) => {
  const { id } = req.params;
  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(id);
  if (!event) {
    return res.status(404).send("Event not found");
  }

  const participants = db.prepare(`
    SELECT ticket_code, name, whatsapp, email, organization, checked_in, checked_in_at, created_at
    FROM participants
    WHERE event_id = ?
    ORDER BY id ASC
  `).all(id);

  // Build clean CSV string
  const headers = ["No", "Nomor Tiket", "Nama Lengkap", "Nomor WhatsApp", "Email", "Instansi / Organisasi", "Status Kehadiran", "Waktu Check-in", "Tanggal Registrasi"];
  
  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = participants.map((p, idx) => [
    idx + 1,
    escapeCsv(p.ticket_code),
    escapeCsv(p.name),
    escapeCsv(p.whatsapp),
    escapeCsv(p.email),
    escapeCsv(p.organization),
    escapeCsv(p.checked_in ? "Hadir" : "Belum Hadir"),
    escapeCsv(p.checked_in_at || "-"),
    escapeCsv(p.created_at || "-"),
  ].join(","));

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="peserta_${event.slug}_${Date.now()}.csv"`);
  res.send(csvContent);
});

export default router;
