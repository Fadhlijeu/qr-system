import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { LocationMapPicker } from "../../components/LocationMapPicker";

// Helper to generate a pure random, unguessable public link ID (no event name text)
function generateLongSlug() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let randomStr = "";
  for (let i = 0; i < 20; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `evt-${randomStr}`;
}

// Normalize a stored "HH:MM - HH:MM <tz>" string into { start, end, tz } parts
function parseTimeRange(value) {
  const raw = String(value || "").trim();
  const tzMatch = raw.match(/\b(WIB|WITA|WIT|UTC|GMT)\b/i);
  const tz = tzMatch ? tzMatch[1].toUpperCase() : "WIB";
  const times = raw.match(/\d{1,2}:\d{2}/g) || [];
  return {
    start: times[0] || "",
    end: times[1] || "",
    tz,
  };
}

// Build the stored time string from picker parts
function buildTimeRange(start, end, tz) {
  if (!start && !end) return "";
  if (start && end) return `${start} - ${end} ${tz}`;
  return `${start || end} ${tz}`;
}

export function AdminEvents({ onSelectEvent, selectedEventId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Delete state — 2-step confirmation
  const [deleteTarget, setDeleteTarget] = useState(null); // event object to delete
  const [deleteStep, setDeleteStep] = useState(1);        // 1 = first confirm, 2 = type name confirm
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    date: "",
    time: "",
    location: "",
    description: "",
    capacity: 0,
    image_url: "",
  });

  // Time picker parts (stored as a single "HH:MM - HH:MM WIB" string in `form.time`)
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [timeTz, setTimeTz] = useState("WIB");

  // Optional Google Maps location picker
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Image picker state: "upload" (file → data URL) or "url" (paste link)
  const [imageMode, setImageMode] = useState("upload");
  const [imageError, setImageError] = useState(null);
  const fileInputRef = React.useRef(null);

  const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("File harus berupa gambar (JPG, PNG, WEBP, atau GIF).");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Ukuran gambar maksimal 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageError(null);
      setForm((prev) => ({ ...prev, image_url: String(reader.result || "") }));
    };
    reader.onerror = () => setImageError("Gagal membaca file gambar.");
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setForm((prev) => ({ ...prev, image_url: "" }));
  };

  // Keep the stored `form.time` in sync with the picker parts
  const updateTime = (nextStart, nextEnd, nextTz) => {
    setTimeStart(nextStart);
    setTimeEnd(nextEnd);
    setTimeTz(nextTz);
    setForm((prev) => ({ ...prev, time: buildTimeRange(nextStart, nextEnd, nextTz) }));
  };

  useEffect(() => {
    loadEvents();
    api.getConfig().then(setConfig).catch(() => {});
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents();
      setEvents(res.events || []);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setErrorMessage(null);
    setImageError(null);
    setImageMode("upload");
    setShowMapPicker(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTimeStart("");
    setTimeEnd("");
    setTimeTz("WIB");
    setForm({
      title: "",
      slug: generateLongSlug(),
      date: new Date().toISOString().substring(0, 10),
      time: "",
      location: "",
      description: "",
      capacity: 0,
      image_url: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (ev) => {
    setEditingEvent(ev);
    setErrorMessage(null);
    setImageError(null);
    setImageMode("upload");
    setShowMapPicker(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    const parsedTime = parseTimeRange(ev.time);
    setTimeStart(parsedTime.start);
    setTimeEnd(parsedTime.end);
    setTimeTz(parsedTime.tz);
    setForm({
      title: ev.title,
      slug: ev.slug,
      date: ev.date,
      time: ev.time || "",
      location: ev.location || "",
      description: ev.description || "",
      capacity: ev.capacity || 0,
      image_url: ev.image_url || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, form);
      } else {
        const res = await api.createEvent(form);
        if (onSelectEvent && res.event?.id) {
          onSelectEvent(res.event.id);
        }
      }
      setShowModal(false);
      loadEvents();
    } catch (err) {
      setErrorMessage(err.message || "Gagal menyimpan data acara.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = (slug, e) => {
    e.stopPropagation();
    const base = config?.guestDomain || window.location.origin;
    const url = `${base}/e/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openDeleteModal = (ev, e) => {
    e.stopPropagation();
    setDeleteTarget(ev);
    setDeleteStep(1);
    setDeleteInput("");
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteStep(1);
    setDeleteInput("");
  };

  const handleDeleteProceed = () => {
    // Step 1 → Step 2: user clicked first "Ya, Hapus" — now ask to type name
    setDeleteStep(2);
    setDeleteInput("");
  };

  const handleDeleteFinal = async () => {
    if (deleteInput.trim() !== deleteTarget.title.trim()) return;
    setDeleting(true);
    try {
      await api.deleteEvent(deleteTarget.id);
      // Deselect if we're deleting the currently active event
      if (deleteTarget.id === selectedEventId) {
        onSelectEvent(null);
      }
      closeDeleteModal();
      loadEvents();
    } catch (err) {
      alert("Gagal menghapus acara: " + (err.message || "Server error"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Pengaturan · Acara</span>
          <h1 className="hero-title">Manajemen Acara</h1>
        </div>
        {events.length > 0 && (
          <div className="hero-actions">
            <button onClick={handleOpenCreate} className="btn btn--primary">
              <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
              <span>Buat Acara Baru</span>
            </button>
          </div>
        )}
      </section>

      {/* Events Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div className="spinner lg" style={{ margin: "0 auto 16px" }}></div>
          <p style={{ color: "var(--t-muted)", fontSize: "13px" }}>Memuat daftar acara...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 32px", maxWidth: "480px", margin: "40px auto" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--primary-soft)", color: "var(--primary)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 20px", color: "var(--t-base)" }}>
            Belum Ada Acara Dibuat
          </h3>
          <button onClick={handleOpenCreate} className="btn btn--primary" style={{ margin: "0 auto" }}>
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            <span>Buat Acara Baru</span>
          </button>
        </div>
      ) : (
        <div className="grid">
          {events.map((ev) => {
            const isSelected = ev.id === selectedEventId;
            const isCopied = copiedId === ev.slug;
            const publicUrl = `${config?.guestDomain || window.location.origin}/e/${ev.slug}`;

            return (
              <section
                key={ev.id}
                className="col-12 card"
                style={{
                  gridColumn: "span 4",
                  cursor: "pointer",
                  border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                  transition: "all .18s ease"
                }}
                onClick={() => onSelectEvent(ev.id)}
              >
                {ev.image_url && (
                  <div
                    style={{
                      position: "relative",
                      margin: "-20px -20px 14px -20px",
                      overflow: "hidden",
                      borderTopLeftRadius: "10px",
                      borderTopRightRadius: "10px",
                      aspectRatio: "16 / 9",
                      background: "var(--bg-muted)",
                    }}
                  >
                    <img
                      src={ev.image_url}
                      alt={ev.title}
                      style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, var(--bg-card, #ffffff) 0%, rgba(255,255,255,0.75) 20%, transparent 70%)",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                )}

                <div className="card-head" style={{ marginBottom: "12px", position: "relative", zIndex: 1 }}>
                  <div className="card-title-wrap">
                    <span className="eyebrow" style={{ color: isSelected ? "var(--primary)" : "var(--t-light)" }}>
                      {isSelected ? "● Acara Aktif" : "Acara"}
                    </span>
                    <h3 className="card-title" style={{ fontSize: "16px" }}>{ev.title}</h3>
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(ev);
                      }}
                      className="btn btn--ghost btn--icon btn--sm"
                      title="Edit Acara"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => openDeleteModal(ev, e)}
                      className="btn btn--ghost btn--icon btn--sm"
                      title="Hapus Acara"
                      style={{ color: "var(--danger)" }}
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: "var(--t-muted)", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    <span>{ev.date} {ev.time ? `· ${ev.time}` : ""}</span>
                  </div>

                  {ev.location && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location)}`, "_blank");
                      }}
                      title="Buka lokasi di Google Maps"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        color: "var(--primary)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ev.location} ↗
                      </span>
                    </div>
                  )}

                  <div style={{ marginTop: "4px" }}>
                    <span
                      className="mono"
                      style={{
                        fontSize: "10.5px",
                        padding: "2px 6px",
                        background: "var(--bg-muted)",
                        borderRadius: "4px",
                        color: "var(--primary)",
                        display: "inline-block",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      /e/{ev.slug}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                  <span className="badge info">{ev.participant_count || 0} Tamu</span>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={(e) => handleCopyLink(ev.slug, e)}
                      className="btn btn--sm btn--ghost"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      {isCopied ? "Tersalin!" : "Salin Link"}
                    </button>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="btn btn--sm btn--ghost btn--icon"
                      title="Buka Halaman Form"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Modal Create / Edit Event */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: "16px",
            overflowY: "auto"
          }}
        >
          <div
            className="modal-demo"
            style={{ width: "100%", maxWidth: "560px", margin: "auto" }}
          >
            <div className="modal-head">
              <div className="modal-title">
                {editingEvent ? "Edit Data Acara" : "Buat Acara Baru"}
              </div>
              <button type="button" onClick={() => setShowModal(false)} style={{ color: "var(--t-light)", cursor: "pointer" }}>
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="alert danger" style={{ margin: "16px 20px 0" }}>
                <div className="body">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="field">
                  <label className="field-label">
                    Judul Acara <span className="req">*</span>
                  </label>
                  <input
                    className="input"
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Nama acara"
                  />
                </div>

                <div className="field">
                  <label className="field-label">URL Unik Acara</label>
                  <div className="input-group">
                    <span className="addon">/e/</span>
                    <input
                      className="input mono"
                      type="text"
                      value={form.slug}
                      readOnly
                      aria-readonly="true"
                      onFocus={(e) => e.target.select()}
                      style={{ color: "var(--t-muted)" }}
                    />
                  </div>
                  <span className="field-help">Dibuat otomatis oleh sistem dan tidak dapat diubah.</span>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label className="field-label">
                      Tanggal Acara <span className="req">*</span>
                    </label>
                    <input
                      className="input"
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Waktu Mulai</label>
                    <input
                      className="input"
                      type="time"
                      value={timeStart}
                      onChange={(e) => updateTime(e.target.value, timeEnd, timeTz)}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Waktu Selesai</label>
                    <input
                      className="input"
                      type="time"
                      value={timeEnd}
                      onChange={(e) => updateTime(timeStart, e.target.value, timeTz)}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Zona Waktu</label>
                    <select
                      className="select"
                      value={timeTz}
                      onChange={(e) => updateTime(timeStart, timeEnd, e.target.value)}
                    >
                      <option value="WIB">WIB (UTC+7)</option>
                      <option value="WITA">WITA (UTC+8)</option>
                      <option value="WIT">WIT (UTC+9)</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Lokasi / Venue</label>
                  <input
                    className="input"
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Nama tempat atau alamat acara"
                  />
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker((v) => !v)}
                      className="btn btn--ghost btn--sm"
                      style={{ fontSize: "11.5px", padding: "5px 12px" }}
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                      <span>{showMapPicker ? "Tutup Pemilih Peta" : "Pilih Titik di Peta (Interactive Pin)"}</span>
                    </button>
                    {form.location && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.location)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}
                      >
                        Buka di Google Maps ↗
                      </a>
                    )}
                  </div>

                  {showMapPicker && (
                    <LocationMapPicker
                      initialValue={form.location}
                      onSelectLocation={(address) => {
                        setForm((prev) => ({ ...prev, location: address }));
                      }}
                      onClose={() => setShowMapPicker(false)}
                    />
                  )}
                </div>

                <div className="field">
                  <label className="field-label">Deskripsi Acara</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Keterangan singkat untuk tamu undangan..."
                  />
                </div>

                {/* Display Image (optional) */}
                <div className="field">
                  <label className="field-label">Gambar Display Acara (opsional)</label>

                  <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`btn btn--sm ${imageMode === "upload" ? "btn--primary" : "btn--ghost"}`}
                      style={{ fontSize: "11.5px", padding: "5px 12px" }}
                    >
                      Unggah File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`btn btn--sm ${imageMode === "url" ? "btn--primary" : "btn--ghost"}`}
                      style={{ fontSize: "11.5px", padding: "5px 12px" }}
                    >
                      Pakai URL
                    </button>
                  </div>

                  {imageMode === "upload" ? (
                    <input
                      ref={fileInputRef}
                      className="input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                    />
                  ) : (
                    <input
                      className="input"
                      type="url"
                      value={form.image_url.startsWith("data:") ? "" : form.image_url}
                      onChange={(e) => {
                        setImageError(null);
                        setForm((prev) => ({ ...prev, image_url: e.target.value }));
                      }}
                      placeholder="https://..."
                    />
                  )}

                  {imageError && (
                    <span style={{ fontSize: "11.5px", color: "var(--danger)", marginTop: "6px", display: "block" }}>
                      {imageError}
                    </span>
                  )}

                  {form.image_url ? (
                    <div style={{ marginTop: "12px", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", background: "var(--bg-muted)" }}>
                      <img
                        src={form.image_url}
                        alt="Pratinjau gambar acara"
                        style={{ display: "block", width: "100%", height: "auto", maxHeight: "220px", objectFit: "cover" }}
                      />
                      <div style={{ padding: "8px 10px", display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={clearImage}
                          className="btn btn--sm btn--ghost"
                          style={{ fontSize: "11.5px", color: "var(--danger)", padding: "4px 10px" }}
                        >
                          Hapus Gambar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="field-help">Kosongkan jika acara tidak perlu gambar display.</span>
                  )}
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn--ghost">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="btn btn--primary">
                  {saving ? "Menyimpan..." : editingEvent ? "Simpan Perubahan" : "Buat Acara"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal (2 steps) ── */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(3px)",
            zIndex: 200,
            display: "grid",
            placeItems: "center",
            padding: "16px",
          }}
        >
          <div
            className="modal-demo"
            style={{ width: "100%", maxWidth: "460px", margin: "auto" }}
          >
            {/* Step 1: First confirmation */}
            {deleteStep === 1 && (
              <>
                <div className="modal-head">
                  <div className="modal-title" style={{ color: "var(--danger)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                    </svg>
                    Hapus Acara
                  </div>
                  <button type="button" onClick={closeDeleteModal} style={{ color: "var(--t-light)", cursor: "pointer", fontSize: "18px" }}>✕</button>
                </div>
                <div className="modal-body" style={{ padding: "20px 24px" }}>
                  <p style={{ fontSize: "14px", color: "var(--t-base)", marginBottom: "12px" }}>
                    Anda akan menghapus acara:
                  </p>
                  <div style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "var(--danger-soft, #fef2f2)",
                    border: "1px solid var(--danger)",
                    marginBottom: "16px"
                  }}>
                    <div style={{ fontWeight: 700, color: "var(--t-base)", fontSize: "14px" }}>{deleteTarget.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--t-muted)", marginTop: "4px" }}>
                      {deleteTarget.participant_count || 0} peserta akan ikut terhapus permanen.
                    </div>
                  </div>
                  <div style={{
                    background: "#fef2f2",
                    border: "1px solid var(--danger)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    margin: 0
                  }}>
                    <p style={{ fontSize: "12.5px", color: "#7f1d1d", margin: 0, lineHeight: 1.6 }}>
                      ⚠ Tindakan ini tidak dapat dibatalkan. Semua data peserta acara ini akan dihapus selamanya.
                    </p>
                  </div>
                </div>
                <div className="modal-foot">
                  <button onClick={closeDeleteModal} className="btn btn--ghost">Batalkan</button>
                  <button onClick={handleDeleteProceed} className="btn btn--primary" style={{ background: "var(--danger)", borderColor: "var(--danger)" }}>
                    Ya, Hapus Acara
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Type event name to confirm */}
            {deleteStep === 2 && (
              <>
                <div className="modal-head">
                  <div className="modal-title" style={{ color: "var(--danger)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Konfirmasi Akhir
                  </div>
                  <button onClick={closeDeleteModal} style={{ color: "var(--t-light)", cursor: "pointer", fontSize: "18px" }}>✕</button>
                </div>
                <div className="modal-body" style={{ padding: "20px 24px" }}>
                  <p style={{ fontSize: "13.5px", color: "var(--t-muted)", marginBottom: "16px", lineHeight: 1.6 }}>
                    Ketik nama acara di bawah untuk memastikan Anda sadar akan tindakan ini:
                  </p>
                  <div className="field" style={{ marginBottom: "8px" }}>
                    <label className="field-label" style={{ fontFamily: "monospace", color: "var(--danger)", fontSize: "12px", marginBottom: "6px", display: "block" }}>
                      {deleteTarget.title}
                    </label>
                    <input
                      className="input"
                      type="text"
                      autoFocus
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      placeholder="Ketik nama acara persis seperti di atas..."
                      style={{ borderColor: deleteInput && deleteInput.trim() !== deleteTarget.title.trim() ? "var(--danger)" : undefined }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && deleteInput.trim() === deleteTarget.title.trim()) {
                          handleDeleteFinal();
                        }
                      }}
                    />
                    {deleteInput && deleteInput.trim() !== deleteTarget.title.trim() && (
                      <span style={{ fontSize: "11.5px", color: "var(--danger)", marginTop: "4px", display: "block" }}>
                        Nama tidak cocok
                      </span>
                    )}
                  </div>
                </div>
                <div className="modal-foot">
                  <button onClick={closeDeleteModal} className="btn btn--ghost">Batalkan</button>
                  <button
                    onClick={handleDeleteFinal}
                    disabled={deleting || deleteInput.trim() !== deleteTarget.title.trim()}
                    className="btn btn--primary"
                    style={{
                      background: "var(--danger)",
                      borderColor: "var(--danger)",
                      opacity: deleteInput.trim() !== deleteTarget.title.trim() ? 0.4 : 1
                    }}
                  >
                    {deleting ? "Menghapus..." : "Hapus Permanen"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
