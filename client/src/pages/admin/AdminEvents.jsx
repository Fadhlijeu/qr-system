import React, { useState, useEffect } from "react";
import { api } from "../../api";

// Helper to generate long random link ID
function generateLongSlug(baseName = "event") {
  const cleanBase = baseName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 16);
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let randomStr = "";
  for (let i = 0; i < 16; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return cleanBase ? `${cleanBase}-${randomStr}` : `evt-${randomStr}`;
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
  });

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
    setForm({
      title: "",
      slug: generateLongSlug("event"),
      date: new Date().toISOString().substring(0, 10),
      time: "09:00 - 17:00 WIB",
      location: "",
      description: "",
      capacity: 0,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (ev) => {
    setEditingEvent(ev);
    setErrorMessage(null);
    setForm({
      title: ev.title,
      slug: ev.slug,
      date: ev.date,
      time: ev.time || "",
      location: ev.location || "",
      description: ev.description || "",
      capacity: ev.capacity || 0,
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
        <div className="hero-actions">
          <button onClick={handleOpenCreate} className="btn btn--primary">
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            <span>Buat Acara Baru</span>
          </button>
        </div>
      </section>

      {/* Events Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div className="spinner lg" style={{ margin: "0 auto 16px" }}></div>
          <p style={{ color: "var(--t-muted)", fontSize: "13px" }}>Memuat daftar acara...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 32px", maxWidth: "560px", margin: "40px auto" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--primary-soft)", color: "var(--primary)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px", color: "var(--t-base)" }}>
            Belum Ada Acara Dibuat
          </h3>
          <p style={{ color: "var(--t-muted)", fontSize: "13px", lineHeight: 1.6, margin: "0 auto 24px", maxWidth: "40ch" }}>
            Klik tombol di bawah untuk menambahkan acara baru.
          </p>
          <button onClick={handleOpenCreate} className="btn btn--primary" style={{ margin: "0 auto" }}>
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            <span>Buat Acara Sekarang</span>
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
                <div className="card-head" style={{ marginBottom: "12px" }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ev.location}
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
          onClick={() => setShowModal(false)}
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
            onClick={(e) => e.stopPropagation()}
            className="modal-demo"
            style={{ width: "100%", maxWidth: "560px", margin: "auto" }}
          >
            <div className="modal-head">
              <div className="modal-title">
                {editingEvent ? "Edit Data Acara" : "Buat Acara Baru"}
              </div>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--t-light)", cursor: "pointer" }}>
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
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        title,
                        slug: !editingEvent ? generateLongSlug(title) : prev.slug
                      }));
                    }}
                    placeholder="Contoh: Grand Opening Cabang Baru"
                  />
                </div>

                <div className="field">
                  <label className="field-label">
                    URL Slug Unik Tamu (ID Acak Panjang) <span className="req">*</span>
                  </label>
                  <div className="input-group">
                    <span className="addon">/e/</span>
                    <input
                      className="input mono"
                      type="text"
                      required
                      value={form.slug}
                      onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                    />
                  </div>
                  <span className="field-help">
                    Tautan unik acak yang panjang untuk mencegah tamu menebak URL acara lain.
                  </span>
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
                    <label className="field-label">Waktu</label>
                    <input
                      className="input"
                      type="text"
                      value={form.time}
                      onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                      placeholder="09:00 - 15:00 WIB"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Lokasi / Venue</label>
                  <input
                    className="input"
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Contoh: Grand Ballroom Lt. 3"
                  />
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
          onClick={closeDeleteModal}
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
            onClick={(e) => e.stopPropagation()}
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
                  <button onClick={closeDeleteModal} style={{ color: "var(--t-light)", cursor: "pointer", fontSize: "18px" }}>✕</button>
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
                  <div className="alert danger" style={{ margin: 0 }}>
                    <div className="body" style={{ fontSize: "12.5px" }}>
                      ⚠ Tindakan ini tidak dapat dibatalkan. Semua data peserta acara ini akan dihapus selamanya.
                    </div>
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
