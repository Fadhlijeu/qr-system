import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../../api";

const AVAILABLE_FONTS = [
  { id: "Outfit", name: "Outfit (Modern Sans)", family: "'Outfit', sans-serif" },
  { id: "Inter", name: "Inter (Clean & Crisp)", family: "'Inter', sans-serif" },
  { id: "Plus Jakarta Sans", name: "Plus Jakarta Sans (Geometric)", family: "'Plus Jakarta Sans', sans-serif" },
  { id: "Poppins", name: "Poppins (Friendly)", family: "'Poppins', sans-serif" },
  { id: "Roboto", name: "Roboto (Neutral)", family: "'Roboto', sans-serif" },
];

const PRESET_ACCENTS = [
  "#8b5cf6", // Royal Purple
  "#2563eb", // Ocean Blue
  "#0d9488", // Emerald Teal
  "#16a34a", // Forest Green
  "#ea580c", // Sunset Orange
  "#e11d48", // Rose Red
];

export function AdminHomepageDesign({ onNavigateToCreateEvent }) {
  const [organizer, setOrganizer] = useState({
    name: "art smiot",
    bio: "Penyelenggara acara resmi & pameran eksklusif.",
    logo_url: "",
    cover_url: "",
    accent_color: "#8b5cf6",
    bg_color: "#f8fafc",
    color_mode: "light",
    font_family: "Outfit",
    email_template: "Tunjukkan tiket QR ini kepada panitia di pintu masuk acara untuk check-in instan.",
    is_published: 1,
  });

  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Accordion sections
  const [openSections, setOpenSections] = useState({
    branding: true,
    theme: true,
    typography: true,
    messages: true,
  });

  // Preview tab: "register" (Form Tamu) vs "ticket" (E-Ticket Tamu)
  const [previewTab, setPreviewTab] = useState("register");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orgRes, evRes] = await Promise.all([
        api.getOrganizerSettings().catch(() => ({ organizer: null })),
        api.getEvents().catch(() => ({ events: [] })),
      ]);

      if (orgRes?.organizer) {
        setOrganizer((prev) => ({
          ...prev,
          ...orgRes.organizer,
          email_template: orgRes.organizer.email_template || prev.email_template,
        }));
      }
      if (evRes?.events && evRes.events.length > 0) {
        setActiveEvent(evRes.events[0]);
      }
    } catch (err) {
      console.error("Gagal memuat data desain:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await api.updateOrganizerSettings(organizer);
      if (res?.organizer) {
        setOrganizer((prev) => ({ ...prev, ...res.organizer }));
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Gagal menyimpan desain: " + (err.message || "Server error"));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setOrganizer((prev) => ({ ...prev, [field]: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const isDark = organizer.color_mode === "dark";
  const activeFont = AVAILABLE_FONTS.find((f) => f.id === organizer.font_family)?.family || "'Outfit', sans-serif";

  // Event info for mock preview
  const displayTitle = activeEvent?.title || "Grand Opening & Exclusive Exhibition 2026";
  const displayDate = activeEvent?.date || "Sabtu, 28 Oktober 2026";
  const displayTime = activeEvent?.time || "19:00 WIB";
  const displayLocation = activeEvent?.location || "Grand Ballroom Hotel Indonesia, Jakarta";
  const displayCover = organizer.cover_url || activeEvent?.image_url;

  return (
    <div>
      {/* Header Section */}
      <section className="hero" style={{ marginBottom: "20px" }}>
        <div className="hero-text">
          <span className="eyebrow">Kustomisasi · Tampilan Tamu</span>
          <h1 className="hero-title">Desain Tampilan Tamu</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--t-muted)" }}>
            Atur tema warna, font, logo, dan banner formulir pendaftaran serta kartu E-Ticket resmi yang dilihat oleh para tamu.
          </p>
        </div>
      </section>

      {/* Two-Column Editor Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(330px, 390px) minmax(360px, 1fr)", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Configuration Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* 1. Branding & Visual Tamu */}
          <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-soft)", borderRadius: "12px" }}>
            <div
              onClick={() => toggleSection("branding")}
              style={{
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                background: "var(--bg-card)",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.52-4.48-10-10-10z" />
                  <circle cx="8" cy="11.5" r="1.5" />
                  <circle cx="9.5" cy="7.5" r="1.5" />
                  <circle cx="14.5" cy="7.5" r="1.5" />
                  <circle cx="16" cy="11.5" r="1.5" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--t-base)" }}>
                  Branding & Visual Tamu
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--t-light)", transform: openSections.branding ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                ▲
              </span>
            </div>

            {openSections.branding && (
              <div style={{ padding: "16px 18px 20px", borderTop: "1px solid var(--border-soft)", display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Cover Banner */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)", display: "block", marginBottom: "6px" }}>
                    Banner Cover Tamu
                  </label>
                  <div
                    style={{
                      border: "2px dashed var(--border)",
                      borderRadius: "10px",
                      padding: "16px",
                      textAlign: "center",
                      background: "var(--bg-muted)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload("cover_url", e)}
                      style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                    />
                    {organizer.cover_url ? (
                      <div>
                        <img
                          src={organizer.cover_url}
                          alt="Cover Banner Tamu"
                          style={{ maxHeight: "80px", maxWidth: "100%", borderRadius: "6px", objectFit: "cover", margin: "0 auto 6px", display: "block" }}
                        />
                        <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: 600 }}>Klik untuk ganti banner</span>
                      </div>
                    ) : (
                      <div>
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: "0 auto 4px", color: "var(--t-light)" }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        <div style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--t-base)" }}>Unggah Banner Acara Tamu</div>
                        <div style={{ fontSize: "10.5px", color: "var(--t-muted)", marginTop: "2px" }}>
                          Rasio 21:9 atau banner horizontal (Maks. 2MB)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo Tamu */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)", display: "block", marginBottom: "6px" }}>
                    Logo Acara / Penyelenggara
                  </label>
                  <div
                    style={{
                      border: "2px dashed var(--border)",
                      borderRadius: "10px",
                      padding: "14px",
                      textAlign: "center",
                      background: "var(--bg-muted)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload("logo_url", e)}
                      style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                    />
                    {organizer.logo_url ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                        <img
                          src={organizer.logo_url}
                          alt="Logo Tamu"
                          style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid #fff" }}
                        />
                        <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: 600 }}>Klik untuk ganti logo</span>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--t-base)" }}>Unggah Logo (Maks. 2MB)</div>
                        <div style={{ fontSize: "10px", color: "var(--t-muted)", marginTop: "2px" }}>
                          Akan tampil di samping nama acara pada formulir & tiket tamu
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nama Penyelenggara */}
                <div className="field" style={{ margin: 0 }}>
                  <label className="field-label" style={{ fontSize: "12px" }}>Nama Penyelenggara Resmi</label>
                  <input
                    className="input"
                    type="text"
                    value={organizer.name}
                    onChange={(e) => setOrganizer((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Grand Opening Committee"
                    style={{ fontSize: "13px" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Tema & Warna Tamu */}
          <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-soft)", borderRadius: "12px" }}>
            <div
              onClick={() => toggleSection("theme")}
              style={{
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                background: "var(--bg-card)",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18" />
                  <path d="M12 12H3" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--t-base)" }}>
                  Tema Warna Tamu
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--t-light)", transform: openSections.theme ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                ▲
              </span>
            </div>

            {openSections.theme && (
              <div style={{ padding: "16px 18px 20px", borderTop: "1px solid var(--border-soft)", display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Accent Color */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)", display: "block", marginBottom: "4px" }}>
                    Warna Aksen Utama Tamu
                  </label>
                  <p style={{ margin: "0 0 10px", fontSize: "11px", color: "var(--t-muted)" }}>
                    Digunakan untuk tombol submit pendaftaran, border tiket QR, dan badge konfirmasi tamu.
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {PRESET_ACCENTS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setOrganizer((prev) => ({ ...prev, accent_color: hex }))}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: hex,
                          border: organizer.accent_color === hex ? "3px solid #000" : "2px solid #fff",
                          boxShadow: organizer.accent_color === hex ? "0 0 0 2px var(--primary)" : "0 1px 3px rgba(0,0,0,0.15)",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="color"
                      value={organizer.accent_color || "#8b5cf6"}
                      onChange={(e) => setOrganizer((prev) => ({ ...prev, accent_color: e.target.value }))}
                      style={{ width: "36px", height: "36px", border: "none", borderRadius: "6px", cursor: "pointer", padding: 0 }}
                    />
                    <input
                      className="input mono"
                      type="text"
                      value={organizer.accent_color}
                      onChange={(e) => setOrganizer((prev) => ({ ...prev, accent_color: e.target.value }))}
                      style={{ fontSize: "12.5px", width: "110px" }}
                    />
                  </div>
                </div>

                {/* Color Mode Tamu */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)", display: "block", marginBottom: "8px" }}>
                    Mode Tampilan Tamu
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setOrganizer((prev) => ({ ...prev, color_mode: "light", bg_color: "#f8fafc" }))}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: !isDark ? "2px solid var(--primary)" : "1px solid var(--border)",
                        background: !isDark ? "var(--primary-soft)" : "var(--bg-card)",
                        color: !isDark ? "var(--primary)" : "var(--t-base)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                      </svg>
                      <span>Light Mode</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrganizer((prev) => ({ ...prev, color_mode: "dark", bg_color: "#0f172a" }))}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: isDark ? "2px solid var(--primary)" : "1px solid var(--border)",
                        background: isDark ? "var(--primary-soft)" : "var(--bg-card)",
                        color: isDark ? "var(--primary)" : "var(--t-base)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                      <span>Dark Mode</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Tipografi Tamu */}
          <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-soft)", borderRadius: "12px" }}>
            <div
              onClick={() => toggleSection("typography")}
              style={{
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                background: "var(--bg-card)",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--t-base)" }}>
                  Tipografi Tamu
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--t-light)", transform: openSections.typography ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                ▲
              </span>
            </div>

            {openSections.typography && (
              <div style={{ padding: "16px 18px 20px", borderTop: "1px solid var(--border-soft)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)", display: "block" }}>
                  Pilihan Font Halaman Tamu
                </label>
                <select
                  className="select"
                  value={organizer.font_family || "Outfit"}
                  onChange={(e) => setOrganizer((prev) => ({ ...prev, font_family: e.target.value }))}
                  style={{ fontSize: "13px" }}
                >
                  {AVAILABLE_FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>

                <div
                  style={{
                    padding: "10px 12px",
                    background: "var(--bg-muted)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--t-base)",
                    fontFamily: activeFont,
                  }}
                >
                  Selamat datang para tamu undangan resmi di acara Grand Opening.
                </div>
              </div>
            )}
          </div>

          {/* 4. Instruksi & Catatan Tiket Tamu */}
          <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-soft)", borderRadius: "12px" }}>
            <div
              onClick={() => toggleSection("messages")}
              style={{
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                background: "var(--bg-card)",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
                <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--t-base)" }}>
                  Instruksi E-Ticket Tamu
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--t-light)", transform: openSections.messages ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                ▲
              </span>
            </div>

            {openSections.messages && (
              <div style={{ padding: "16px 18px 20px", borderTop: "1px solid var(--border-soft)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)", display: "block" }}>
                  Catatan Kedatangan pada E-Ticket
                </label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={organizer.email_template}
                  onChange={(e) => setOrganizer((prev) => ({ ...prev, email_template: e.target.value }))}
                  placeholder="Contoh: Tunjukkan tiket QR ini kepada panitia di pintu masuk acara untuk check-in..."
                  style={{ fontSize: "12px" }}
                />
              </div>
            )}
          </div>

          {/* Save Action */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn--primary"
            style={{ width: "100%", padding: "13px", fontSize: "13.5px", justifyContent: "center" }}
          >
            {saving ? "Menyimpan Desain..." : saveSuccess ? "✓ Desain Tamu Disimpan!" : "Simpan Desain Tamu"}
          </button>
        </div>

        {/* Right Column: Live Guest Experience Preview */}
        <div style={{ position: "sticky", top: "20px" }}>
          {/* Top Preview Bar with Switcher */}
          <div
            style={{
              padding: "10px 14px",
              background: "#334155",
              color: "#ffffff",
              borderRadius: "12px 12px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setPreviewTab("register")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: previewTab === "register" ? organizer.accent_color : "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" />
                </svg>
                <span>Form Registrasi Tamu</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTab("ticket")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: previewTab === "ticket" ? organizer.accent_color : "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
                <span>E-Ticket Tamu</span>
              </button>
            </div>

            <a
              href={activeEvent?.slug ? `/e/${activeEvent.slug}` : "/"}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#e2e8f0",
                fontSize: "11px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: 500,
              }}
            >
              <span>Buka Halaman Tamu</span>
              <span>↗</span>
            </a>
          </div>

          {/* Embedded Guest Mockup Canvas */}
          <div
            style={{
              background: organizer.bg_color || "#f8fafc",
              borderRadius: "0 0 14px 14px",
              border: "1px solid var(--border)",
              borderTop: "none",
              padding: "24px 20px",
              minHeight: "560px",
              display: "flex",
              flexDirection: "column",
              fontFamily: activeFont,
              color: isDark ? "#f8fafc" : "#0f172a",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              transition: "background .2s, color .2s",
            }}
          >
            {/* View 1: Form Registrasi Tamu */}
            {previewTab === "register" && (
              <div style={{ maxWidth: "560px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Event Card with Cover */}
                <div
                  style={{
                    background: isDark ? "#1e293b" : "#ffffff",
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: isDark ? "1px solid #334155" : "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                  }}
                >
                  {displayCover && (
                    <div style={{ height: "130px", width: "100%", overflow: "hidden", position: "relative" }}>
                      <img src={displayCover} alt="Cover Acara" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: isDark
                            ? "linear-gradient(to top, #1e293b 0%, rgba(30,41,59,0.7) 30%, transparent 80%)"
                            : "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.7) 30%, transparent 80%)",
                        }}
                      />
                    </div>
                  )}

                  <div style={{ padding: "18px 20px", marginTop: displayCover ? "-18px" : "0", position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      {organizer.logo_url ? (
                        <img
                          src={organizer.logo_url}
                          alt="Logo"
                          style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "2px solid #fff" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: organizer.accent_color,
                            color: "#fff",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 700,
                            fontSize: "14px",
                          }}
                        >
                          {(organizer.name || "A")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
                          {organizer.name || "Penyelenggara Resmi"}
                        </div>
                        <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: isDark ? "#f8fafc" : "#0f172a" }}>
                          {displayTitle}
                        </h2>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", borderTop: isDark ? "1px solid #334155" : "1px solid #f1f5f9", paddingTop: "10px", fontSize: "11.5px", color: isDark ? "#cbd5e1" : "#475569" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{displayDate} · {displayTime}</span>
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 21.5C7.5 16 5 12.5 5 9a7 7 0 1 1 14 0c0 3.5-2.5 7-7 12.5z" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                        <span>{displayLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Form Card */}
                <div
                  style={{
                    background: isDark ? "#1e293b" : "#ffffff",
                    borderRadius: "14px",
                    padding: "20px",
                    border: isDark ? "1px solid #334155" : "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ borderBottom: isDark ? "1px solid #334155" : "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 2px", color: isDark ? "#f8fafc" : "#0f172a" }}>
                      Formulir Registrasi Tamu
                    </h3>
                    <p style={{ margin: 0, fontSize: "11.5px", color: isDark ? "#94a3b8" : "#64748b" }}>
                      Isi data Anda untuk menerima E-Ticket resmi secara instan.
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 600, color: isDark ? "#cbd5e1" : "#475569", display: "block", marginBottom: "4px" }}>
                        Nama Lengkap Tamu
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="Dimas Pratama"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: isDark ? "1px solid #475569" : "1px solid #cbd5e1",
                          background: isDark ? "#0f172a" : "#f8fafc",
                          color: isDark ? "#f8fafc" : "#0f172a",
                          fontSize: "12px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 600, color: isDark ? "#cbd5e1" : "#475569", display: "block", marginBottom: "4px" }}>
                        Nomor WhatsApp
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="0812-3456-7890"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: isDark ? "1px solid #475569" : "1px solid #cbd5e1",
                          background: isDark ? "#0f172a" : "#f8fafc",
                          color: isDark ? "#f8fafc" : "#0f172a",
                          fontSize: "12px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      style={{
                        marginTop: "6px",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none",
                        background: organizer.accent_color || "#8b5cf6",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        boxShadow: `0 4px 12px ${organizer.accent_color}40`,
                      }}
                    >
                      <span>Dapatkan E-Ticket QR Resmi</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* View 2: E-Ticket Tamu */}
            {previewTab === "ticket" && (
              <div style={{ maxWidth: "460px", margin: "0 auto", width: "100%" }}>
                {/* Boarding-Pass Style Ticket Card */}
                <div
                  style={{
                    background: isDark ? "#1e293b" : "#ffffff",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: isDark ? "1px solid #334155" : "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Top Color Accent Bar */}
                  <div style={{ height: "5px", background: organizer.accent_color, width: "100%" }} />

                  {/* Top Ticket Details */}
                  <div style={{ padding: "20px 22px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {organizer.logo_url ? (
                          <img
                            src={organizer.logo_url}
                            alt="Logo"
                            style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: organizer.accent_color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: "13px" }}>
                            {(organizer.name || "A")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: "10.5px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
                            {organizer.name || "Grand Opening Committee"}
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a" }}>
                            {displayTitle}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "20px",
                          background: `${organizer.accent_color}20`,
                          color: organizer.accent_color,
                        }}
                      >
                        VIP PASS
                      </span>
                    </div>

                    <div style={{ borderTop: isDark ? "1px solid #334155" : "1px solid #f1f5f9", paddingTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "11px" }}>
                      <div>
                        <div style={{ color: isDark ? "#94a3b8" : "#64748b" }}>Nama Tamu:</div>
                        <div style={{ fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a" }}>Dimas Pratama</div>
                      </div>
                      <div>
                        <div style={{ color: isDark ? "#94a3b8" : "#64748b" }}>Waktu & Lokasi:</div>
                        <div style={{ fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a" }}>{displayDate}</div>
                      </div>
                    </div>
                  </div>

                  {/* Perforated Divider Line with Cutouts */}
                  <div style={{ position: "relative", display: "flex", alignItems: "center", margin: "4px 0" }}>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: organizer.bg_color || "#f8fafc",
                        marginLeft: "-8px",
                      }}
                    />
                    <div style={{ flex: 1, borderTop: isDark ? "2px dashed #475569" : "2px dashed #cbd5e1" }} />
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: organizer.bg_color || "#f8fafc",
                        marginRight: "-8px",
                      }}
                    />
                  </div>

                  {/* QR Code Section */}
                  <div style={{ padding: "16px 22px 22px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "12px",
                        background: "#ffffff",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        border: `2px solid ${organizer.accent_color}40`,
                      }}
                    >
                      <QRCodeSVG value="TICKET-DEMO-VIP-2026" size={130} />
                    </div>

                    <div style={{ marginTop: "10px", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", color: organizer.accent_color }}>
                      #TKT-VIP-88912
                    </div>

                    <p style={{ margin: "8px 0 0", fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", lineHeight: 1.4 }}>
                      {organizer.email_template}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
