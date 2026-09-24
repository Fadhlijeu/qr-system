import { Router } from "express";
import crypto from "node:crypto";
import { db } from "../db.js";
import { requireAdmin } from "../auth.js";
import { checkinLimiter, sanitizeCsvCell } from "../security.js";

const router = Router();
router.use(requireAdmin);

// Helper to enforce authorization / tenant boundary (prevent IDOR)
function getAdminEvent(eventId, adminId) {
  return db.prepare("SELECT * FROM events WHERE id = ? AND (admin_id = ? OR admin_id IS NULL)").get(eventId, adminId || 0);
}

// Normalize an incoming coordinate value.
// Accepts: empty/null/undefined (no coordinate), or a finite number.
function normalizeCoordinate(raw, label) {
  if (raw === undefined || raw === null || raw === "") return { ok: true, value: null };
  const num = Number(raw);
  if (!Number.isFinite(num)) {
    return { ok: false, error: `Koordinat ${label} tidak valid.` };
  }
  const limit = label === "lat" ? 90 : 180;
  if (num < -limit || num > limit) {
    return { ok: false, error: `Koordinat ${label} di luar rentang yang wajar.` };
  }
  return { ok: true, value: num };
}

// Max size for an uploaded event image sent as a data URL (~2MB binary → ~2.7MB base64)
const MAX_IMAGE_DATA_URL_LENGTH = 2_800_000;


// Normalize an incoming image value.
// Accepts: empty string (no image), a data URL (uploaded file), or an http(s) URL.
function normalizeEventImage(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return { ok: true, value: "" };

  if (value.startsWith("data:image/")) {
    if (value.length > MAX_IMAGE_DATA_URL_LENGTH) {
      return { ok: false, error: "Ukuran gambar terlalu besar. Maksimal sekitar 2MB." };
    }
    return { ok: true, value };
  }

  if (/^https?:\/\//i.test(value)) {
    if (value.length > 2048) {
      return { ok: false, error: "URL gambar terlalu panjang." };
    }
    return { ok: true, value };
  }

  return { ok: false, error: "Format gambar tidak dikenali. Gunakan file gambar atau URL http(s)." };
}

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

// Helper to automatically cache reused venues to saved_locations
function maybeAutoSaveLocation(adminId, locationText, lat, lng, capacity) {
  if (!locationText || !locationText.trim()) return;
  const cleanAddr = locationText.trim();
  const cleanName = cleanAddr.split(",")[0].trim();
  try {
    const existing = db.prepare(
      "SELECT id FROM saved_locations WHERE (admin_id = ? OR admin_id IS NULL) AND (name = ? OR address = ?)"
    ).get(adminId || 0, cleanName, cleanAddr);
    if (!existing) {
      db.prepare(`
        INSERT INTO saved_locations (admin_id, name, address, lat, lng, capacity)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(adminId || null, cleanName, cleanAddr, lat || null, lng || null, Number(capacity) || 0);
    }
  } catch (err) {
    // Ignore duplicate or concurrent insert errors
  }
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
  const { title, slug, description, location, date, time, capacity, status, image_url, lat, lng } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: "Judul acara wajib diisi." });
  }
  if (!date?.trim()) {
    return res.status(400).json({ error: "Tanggal acara wajib diisi." });
  }

  const image = normalizeEventImage(image_url);
  if (!image.ok) {
    return res.status(400).json({ error: image.error });
  }

  const latitude = normalizeCoordinate(lat, "lat");
  if (!latitude.ok) {
    return res.status(400).json({ error: latitude.error });
  }
  const longitude = normalizeCoordinate(lng, "lng");
  if (!longitude.ok) {
    return res.status(400).json({ error: longitude.error });
  }

  // Generate slug if not provided, or sanitize provided slug
  let cleanSlug = (slug || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!cleanSlug) {
    // Pure random public link ID — never derived from the event title
    cleanSlug = `evt-${crypto.randomBytes(10).toString("hex")}`;
  } else {
    // Check unique slug and append long random token if collision
    const existing = db.prepare("SELECT id FROM events WHERE slug = ?").get(cleanSlug);
    if (existing) {
      cleanSlug = `${cleanSlug}-${crypto.randomBytes(6).toString("hex")}`;
    }
  }

  const result = db.prepare(`
    INSERT INTO events (admin_id, title, slug, description, location, date, time, capacity, status, image_url, lat, lng)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    adminId || null,
    title.trim(),
    cleanSlug,
    description?.trim() || "",
    location?.trim() || "",
    date.trim(),
    time?.trim() || "",
    Number(capacity) || 0,
    status || "ACTIVE",
    image.value,
    latitude.value,
    longitude.value
  );

  maybeAutoSaveLocation(adminId, location, latitude.value, longitude.value, capacity);

  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(Number(result.lastInsertRowid));
  res.status(201).json({ event });
});

// 3. Update Event
router.put("/events/:id", (req, res) => {
  const { id } = req.params;
  const adminId = req.admin?.id;
  const { title, description, location, date, time, capacity, status, image_url, lat, lng } = req.body;

  const event = getAdminEvent(id, adminId);
  if (!event) {
    return res.status(404).json({ error: "Acara tidak ditemukan atau Anda tidak memiliki izin." });
  }

  let nextImage = event.image_url;
  if (image_url !== undefined) {
    const image = normalizeEventImage(image_url);
    if (!image.ok) {
      return res.status(400).json({ error: image.error });
    }
    nextImage = image.value;
  }

  let nextLat = event.lat ?? null;
  if (lat !== undefined) {
    const parsed = normalizeCoordinate(lat, "lat");
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }
    nextLat = parsed.value;
  }

  let nextLng = event.lng ?? null;
  if (lng !== undefined) {
    const parsed = normalizeCoordinate(lng, "lng");
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }
    nextLng = parsed.value;
  }

  db.prepare(`
    UPDATE events
    SET title = ?, description = ?, location = ?, date = ?, time = ?, capacity = ?, status = ?, image_url = ?, lat = ?, lng = ?, updated_at = datetime('now', 'localtime')
    WHERE id = ?
  `).run(
    title?.trim() || event.title,
    description !== undefined ? description.trim() : event.description,
    location !== undefined ? location.trim() : event.location,
    date?.trim() || event.date,
    time !== undefined ? time.trim() : event.time,
    capacity !== undefined ? Number(capacity) : event.capacity,
    status || event.status,
    nextImage || "",
    nextLat,
    nextLng,
    id
  );

  maybeAutoSaveLocation(adminId, location !== undefined ? location : event.location, nextLat, nextLng, capacity !== undefined ? capacity : event.capacity);

  const updated = db.prepare("SELECT * FROM events WHERE id = ?").get(id);
  res.json({ event: updated });
});

// 4. Delete Event (with all participants cascade, scoped to authorized admin)
router.delete("/events/:id", (req, res) => {
  const { id } = req.params;
  const adminId = req.admin?.id;

  const event = getAdminEvent(id, adminId);
  if (!event) {
    return res.status(404).json({ error: "Acara tidak ditemukan atau Anda tidak memiliki izin." });
  }

  // Cascade: delete all participants of this event first
  db.prepare("DELETE FROM participants WHERE event_id = ?").run(id);
  db.prepare("DELETE FROM events WHERE id = ?").run(id);

  res.json({ success: true, message: "Acara dan semua pesertanya berhasil dihapus." });
});

// 5. Dashboard Metrics for an event (scoped to authorized admin)
router.get("/events/:id/dashboard", (req, res) => {
  const { id } = req.params;
  const adminId = req.admin?.id;

  const event = getAdminEvent(id, adminId);
  if (!event) {
    return res.status(404).json({ error: "Acara tidak ditemukan atau Anda tidak memiliki izin." });
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

// 6. Participants list with Search & Filter (scoped to authorized admin)
router.get("/events/:id/participants", (req, res) => {
  const { id } = req.params;
  const adminId = req.admin?.id;

  const event = getAdminEvent(id, adminId);
  if (!event) {
    return res.status(404).json({ error: "Acara tidak ditemukan atau Anda tidak memiliki izin." });
  }

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

// 7. Manual Check-in toggle (scoped to authorized admin's event)
router.post("/participants/:id/toggle-checkin", (req, res) => {
  const { id } = req.params;
  const adminId = req.admin?.id;

  const participant = db.prepare(`
    SELECT p.*, e.admin_id
    FROM participants p
    JOIN events e ON p.event_id = e.id
    WHERE p.id = ? AND (e.admin_id = ? OR e.admin_id IS NULL)
  `).get(id, adminId || 0);

  if (!participant) {
    return res.status(404).json({ error: "Peserta tidak ditemukan atau Anda tidak memiliki izin." });
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

// 8. QR SCANNER CHECK-IN ENDPOINT (with rate limiter, admin scoping, and atomic concurrency lock)
router.post("/check-in", checkinLimiter, (req, res) => {
  const { code, event_id } = req.body;
  const adminId = req.admin?.id;

  if (!code) {
    return res.status(400).json({ status: "INVALID", message: "Kode QR tidak boleh kosong." });
  }

  const cleanCode = extractTicketCode(code);

  let query = `
    SELECT p.*, e.title as event_title, e.admin_id
    FROM participants p
    JOIN events e ON p.event_id = e.id
    WHERE p.ticket_code = ? AND (e.admin_id = ? OR e.admin_id IS NULL)
  `;
  const params = [cleanCode, adminId || 0];

  if (event_id) {
    query += " AND p.event_id = ?";
    params.push(event_id);
  }

  const participant = db.prepare(query).get(...params);

  // 1. Invalid QR or unauthorized
  if (!participant) {
    return res.json({
      status: "INVALID",
      code: cleanCode,
      message: "Tiket tidak terdaftar atau tidak sesuai dengan acara yang Anda kelola.",
    });
  }

  // 2. Already Checked In
  if (participant.checked_in === 1) {
    return res.json({
      status: "ALREADY_CHECKED_IN",
      message: "Peserta sudah melakukan check-in sebelumnya.",
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

  // 3. Atomic Success Check-In (Prevents double check-in race conditions across concurrent scanners)
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const updateResult = db.prepare(
    "UPDATE participants SET checked_in = 1, checked_in_at = ? WHERE id = ? AND checked_in = 0"
  ).run(now, participant.id);

  if (updateResult.changes === 0) {
    // Another concurrent scanner checked them in at the exact same millisecond
    const fresh = db.prepare("SELECT * FROM participants WHERE id = ?").get(participant.id);
    return res.json({
      status: "ALREADY_CHECKED_IN",
      message: "Peserta baru saja check-in di pemindai lain.",
      participant: fresh,
    });
  }

  const updated = db.prepare("SELECT * FROM participants WHERE id = ?").get(participant.id);

  return res.json({
    status: "SUCCESS",
    message: "Selamat datang!",
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

// 9. CSV Export (scoped to authorized admin + Formula Injection sanitized)
router.get("/events/:id/export", (req, res) => {
  const { id } = req.params;
  const adminId = req.admin?.id;

  const event = getAdminEvent(id, adminId);
  if (!event) {
    return res.status(404).send("Acara tidak ditemukan atau Anda tidak memiliki izin.");
  }

  const participants = db.prepare(`
    SELECT ticket_code, name, whatsapp, email, organization, checked_in, checked_in_at, created_at
    FROM participants
    WHERE event_id = ?
    ORDER BY id ASC
  `).all(id);

  // Build clean, formula-injection-safe CSV string
  const headers = ["No", "Nomor Tiket", "Nama Lengkap", "Nomor WhatsApp", "Email", "Instansi / Organisasi", "Status Kehadiran", "Waktu Check-in", "Tanggal Registrasi"];

  const rows = participants.map((p, idx) => [
    idx + 1,
    sanitizeCsvCell(p.ticket_code),
    sanitizeCsvCell(p.name),
    sanitizeCsvCell(p.whatsapp),
    sanitizeCsvCell(p.email),
    sanitizeCsvCell(p.organization),
    sanitizeCsvCell(p.checked_in ? "Hadir" : "Belum Hadir"),
    sanitizeCsvCell(p.checked_in_at || "-"),
    sanitizeCsvCell(p.created_at || "-"),
  ].join(","));

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="peserta_${event.slug}_${Date.now()}.csv"`);
  res.send(csvContent);
});

// 10. SAVED LOCATIONS (Reusable Venues)
router.get("/locations", (req, res) => {
  const adminId = req.admin?.id;
  const locations = db.prepare(`
    SELECT * FROM saved_locations
    WHERE admin_id = ? OR admin_id IS NULL
    ORDER BY id DESC
  `).all(adminId || 0);
  res.json({ locations });
});

router.post("/locations", (req, res) => {
  const adminId = req.admin?.id;
  const { name, address, lat, lng, capacity } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Nama tempat/venue wajib diisi." });
  }

  const result = db.prepare(`
    INSERT INTO saved_locations (admin_id, name, address, lat, lng, capacity)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    adminId || null,
    name.trim(),
    address?.trim() || name.trim(),
    Number(lat) || null,
    Number(lng) || null,
    Number(capacity) || 0
  );

  const location = db.prepare("SELECT * FROM saved_locations WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ location });
});

router.put("/locations/:id", (req, res) => {
  const { id } = req.params;
  const adminId = req.admin?.id;
  const { name, address, lat, lng, capacity } = req.body;

  const loc = db.prepare("SELECT * FROM saved_locations WHERE id = ? AND (admin_id = ? OR admin_id IS NULL)").get(id, adminId || 0);
  if (!loc) {
    return res.status(404).json({ error: "Lokasi tidak ditemukan atau tidak memiliki izin." });
  }

  db.prepare(`
    UPDATE saved_locations
    SET name = ?, address = ?, lat = ?, lng = ?, capacity = ?
    WHERE id = ?
  `).run(
    name?.trim() || loc.name,
    address !== undefined ? address.trim() : loc.address,
    lat !== undefined ? Number(lat) : loc.lat,
    lng !== undefined ? Number(lng) : loc.lng,
    capacity !== undefined ? Number(capacity) : loc.capacity,
    id
  );

  const updated = db.prepare("SELECT * FROM saved_locations WHERE id = ?").get(id);
  res.json({ location: updated });
});

router.delete("/locations/:id", (req, res) => {
  const { id } = req.params;
  const adminId = req.admin?.id;

  const loc = db.prepare("SELECT * FROM saved_locations WHERE id = ? AND (admin_id = ? OR admin_id IS NULL)").get(id, adminId || 0);
  if (!loc) {
    return res.status(404).json({ error: "Lokasi tidak ditemukan atau tidak memiliki izin." });
  }

  db.prepare("DELETE FROM saved_locations WHERE id = ?").run(id);
  res.json({ success: true });
});

// 11. ORGANIZER PROFILE & HOMEPAGE DESIGN
router.get("/organizer", (req, res) => {
  const adminId = req.admin?.id;
  let org = db.prepare("SELECT * FROM organizer_settings WHERE admin_id = ?").get(adminId || 0);
  const admin = db.prepare("SELECT id, name, email FROM admins WHERE id = ?").get(adminId || 0);

  if (!org) {
    org = {
      admin_id: adminId,
      name: admin?.name || "Organizer",
      bio: "",
      logo_url: "",
      cover_url: "",
      accent_color: "#8b5cf6",
      bg_color: "#f8fafc",
      color_mode: "light",
      font_family: "Outfit",
      social_instagram: "",
      social_website: "",
      social_linkedin: "",
      social_twitter: "",
      email_template: "",
      seo_title: "",
      seo_description: "",
      is_published: 1,
    };
  }

  res.json({ organizer: org, admin });
});

router.put("/organizer", (req, res) => {
  const adminId = req.admin?.id;
  const {
    name,
    bio,
    logo_url,
    cover_url,
    accent_color,
    bg_color,
    color_mode,
    font_family,
    social_instagram,
    social_website,
    social_linkedin,
    social_twitter,
    email_template,
    seo_title,
    seo_description,
    is_published,
  } = req.body;

  const existing = db.prepare("SELECT admin_id FROM organizer_settings WHERE admin_id = ?").get(adminId || 0);
  if (existing) {
    db.prepare(`
      UPDATE organizer_settings SET
        name = ?, bio = ?, logo_url = ?, cover_url = ?, accent_color = ?,
        bg_color = ?, color_mode = ?, font_family = ?, social_instagram = ?,
        social_website = ?, social_linkedin = ?, social_twitter = ?,
        email_template = ?, seo_title = ?, seo_description = ?, is_published = ?,
        updated_at = datetime('now', 'localtime')
      WHERE admin_id = ?
    `).run(
      name || "",
      bio || "",
      logo_url || "",
      cover_url || "",
      accent_color || "#8b5cf6",
      bg_color || "#f8fafc",
      color_mode || "light",
      font_family || "Outfit",
      social_instagram || "",
      social_website || "",
      social_linkedin || "",
      social_twitter || "",
      email_template || "",
      seo_title || "",
      seo_description || "",
      is_published ? 1 : 0,
      adminId
    );
  } else {
    db.prepare(`
      INSERT INTO organizer_settings (
        admin_id, name, bio, logo_url, cover_url, accent_color, bg_color,
        color_mode, font_family, social_instagram, social_website,
        social_linkedin, social_twitter, email_template, seo_title,
        seo_description, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      adminId,
      name || "",
      bio || "",
      logo_url || "",
      cover_url || "",
      accent_color || "#8b5cf6",
      bg_color || "#f8fafc",
      color_mode || "light",
      font_family || "Outfit",
      social_instagram || "",
      social_website || "",
      social_linkedin || "",
      social_twitter || "",
      email_template || "",
      seo_title || "",
      seo_description || "",
      is_published ? 1 : 0
    );
  }

  const updated = db.prepare("SELECT * FROM organizer_settings WHERE admin_id = ?").get(adminId || 0);
  res.json({ organizer: updated });
});

export default router;
