import React, { useState, useEffect } from "react";
import { api } from "../../api";

const AVAILABLE_FONTS = [
  { id: "Outfit", name: "Outfit (Modern Sans)", family: "'Outfit', sans-serif" },
  { id: "Inter", name: "Inter (Clean & Crisp)", family: "'Inter', sans-serif" },
  { id: "Plus Jakarta Sans", name: "Plus Jakarta Sans (Geometric)", family: "'Plus Jakarta Sans', sans-serif" },
  { id: "Poppins", name: "Poppins (Friendly)", family: "'Poppins', sans-serif" },
  { id: "Roboto", name: "Roboto (Neutral)", family: "'Roboto', sans-serif" },
];

const PRESET_ACCENTS = [
  "#8b5cf6", // Purple (Hi.Events default)
  "#2563eb", // Blue
  "#0d9488", // Teal
  "#16a34a", // Emerald
  "#ea580c", // Orange
  "#e11d48", // Rose
];

export function AdminHomepageDesign({ onNavigateToCreateEvent }) {
  const [organizer, setOrganizer] = useState({
    name: "art smiot",
    bio: "Penyelenggara acara resmi & pameran eksklusif.",
    logo_url: "",
    cover_url: "",
    accent_color: "#8b5cf6",
    bg_color: "#f5f3ff",
    color_mode: "light",
    font_family: "Outfit",
    is_published: 1,
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active accordion sections
  const [openSections, setOpenSections] = useState({
    images: true,
    theme: true,
    typography: true,
  });

  // Preview tab: upcoming vs past
  const [previewTab, setPreviewTab] = useState("upcoming");

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
        setOrganizer(orgRes.organizer);
      }
      setEvents(evRes?.events || []);
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
      if (res?.organizer) setOrganizer(res.organizer);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Gagal menyimpan desain: " + (err.message || "Server error"));
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    const publicUrl = `${window.location.origin}/org`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  // Determine contrast warning between text and background
  const isDarkBg = organizer.color_mode === "dark" || organizer.bg_color === "#0f172a";
  const lowContrastWarning = !isDarkBg && (organizer.bg_color === "#ffffff" && organizer.accent_color === "#fef08a");

  return (
    <div>
      {/* Sub-header & Breadcrumb Navigation matching Screenshot 2 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 0 16px",
          borderBottom: "1px solid var(--border-soft)",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--t-muted)" }}>
          <span style={{ fontWeight: 600, color: "var(--t-base)" }}>{organizer.name || "Organizer"}</span>
          <span>/</span>
          <button
            onClick={() => onNavigateToCreateEvent && onNavigateToCreateEvent()}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "var(--primary)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: 500,
            }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span>Create Event</span>
          </button>
        </div>

        <button
          onClick={handleShare}
          className="btn btn--sm btn--ghost"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px" }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span>{copied ? "Link Tersalin!" : "Share Organizer Page"}</span>
        </button>
      </div>

      {/* Main Title */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px", color: "var(--t-base)" }}>
          Homepage Design
        </h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--t-muted)" }}>
          Customize your organizer page appearance
        </p>
      </div>

      {/* Two-Column Editor Layout matching Screenshots 2, 3, 4 */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 420px) minmax(360px, 1fr)", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Configuration Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 1. Images Accordion (Screenshot 2) */}
          <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border-soft)", borderRadius: "12px" }}>
            <div
              onClick={() => toggleSection("images")}
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
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--t-base)" }}>Images</span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--t-light)", transform: openSections.images ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                ▲
              </span>
            </div>

            {openSections.images && (
              <div style={{ padding: "16px 18px 20px", borderTop: "1px solid var(--border-soft)", display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Cover Image */}
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--t-base)", display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                    <span>Cover Image</span>
                    <span title="Cover image will be displayed at the top of your organizer page" style={{ color: "var(--t-light)", cursor: "help" }}>ⓘ</span>
                  </label>

                  <div
                    style={{
                      border: "2px dashed var(--border)",
                      borderRadius: "10px",
                      padding: "24px 16px",
                      textAlign: "center",
                      background: "var(--bg-muted)",
                      cursor: "pointer",
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
                          alt="Cover preview"
                          style={{ maxHeight: "90px", maxWidth: "100%", borderRadius: "6px", objectFit: "cover", margin: "0 auto 8px", display: "block" }}
                        />
                        <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: 600 }}>Ganti Cover Image</span>
                      </div>
                    ) : (
                      <div>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: "0 auto 6px", color: "var(--t-light)" }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)" }}>Click to upload</div>
                        <div style={{ fontSize: "10.5px", color: "var(--t-muted)", marginTop: "2px" }}>
                          Cover image will be displayed at the top of your organizer page
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo Image */}
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--t-base)", display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                    <span>Logo</span>
                    <span title="Logo will be displayed in the header" style={{ color: "var(--t-light)", cursor: "help" }}>ⓘ</span>
                  </label>

                  <div
                    style={{
                      border: "2px dashed var(--border)",
                      borderRadius: "10px",
                      padding: "20px 16px",
                      textAlign: "center",
                      background: "var(--bg-muted)",
                      cursor: "pointer",
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
                          alt="Logo preview"
                          style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: 600 }}>Ganti Logo</span>
                      </div>
                    ) : (
                      <div>
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: "0 auto 4px", color: "var(--t-light)" }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)" }}>Click to upload</div>
                        <div style={{ fontSize: "10.5px", color: "var(--t-muted)", marginTop: "2px" }}>
                          Logo will be displayed in the header
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Theme & Colors Accordion (Screenshots 3 & 4) */}
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
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
                </svg>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--t-base)" }}>Theme & Colors</span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--t-light)", transform: openSections.theme ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                ▲
              </span>
            </div>

            {openSections.theme && (
              <div style={{ padding: "16px 18px 20px", borderTop: "1px solid var(--border-soft)", display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Background Type */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)", display: "block", marginBottom: "6px" }}>
                    Background Type
                  </label>
                  <div
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "var(--bg-card)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)" }}>Color</div>
                        <div style={{ fontSize: "10.5px", color: "var(--t-muted)" }}>Choose a color for your background</div>
                      </div>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--t-light)" }}>⇅</span>
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)", display: "block", marginBottom: "2px" }}>
                    Accent Color
                  </label>
                  <p style={{ margin: "0 0 8px", fontSize: "11px", color: "var(--t-muted)" }}>
                    The primary brand color used for buttons and highlights
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        flex: 1,
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "var(--bg-card)",
                      }}
                    >
                      <input
                        type="color"
                        value={organizer.accent_color || "#8b5cf6"}
                        onChange={(e) => setOrganizer((prev) => ({ ...prev, accent_color: e.target.value }))}
                        style={{ width: "24px", height: "24px", border: "none", borderRadius: "50%", cursor: "pointer", padding: 0 }}
                      />
                      <span className="mono" style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)" }}>
                        {organizer.accent_color || "#8b5cf6"}
                      </span>
                    </div>

                    {/* Presets */}
                    <div style={{ display: "flex", gap: "4px" }}>
                      {PRESET_ACCENTS.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setOrganizer((prev) => ({ ...prev, accent_color: hex }))}
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: hex,
                            border: organizer.accent_color === hex ? "2px solid #000" : "1px solid rgba(0,0,0,0.1)",
                            cursor: "pointer",
                            padding: 0,
                          }}
                          title={hex}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Background Color */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)", display: "block", marginBottom: "2px" }}>
                    Background Color
                  </label>
                  <p style={{ margin: "0 0 8px", fontSize: "11px", color: "var(--t-muted)", lineHeight: 1.4 }}>
                    The background color of the page. When using cover image, this is applied as an overlay.
                  </p>

                  <div
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "var(--bg-card)",
                    }}
                  >
                    <input
                      type="color"
                      value={organizer.bg_color || "#f5f3ff"}
                      onChange={(e) => setOrganizer((prev) => ({ ...prev, bg_color: e.target.value }))}
                      style={{ width: "24px", height: "24px", border: "none", borderRadius: "50%", cursor: "pointer", padding: 0 }}
                    />
                    <span className="mono" style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)" }}>
                      {organizer.bg_color || "#f5f3ff"}
                    </span>
                  </div>
                </div>

                {/* Color Mode & Contrast Alert (Screenshot 4) */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)", display: "block", marginBottom: "2px" }}>
                    Color Mode
                  </label>
                  <p style={{ margin: "0 0 8px", fontSize: "11px", color: "var(--t-muted)" }}>
                    Automatically detected based on background color, but can be overridden
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", background: "var(--bg-muted)", padding: "3px", borderRadius: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setOrganizer((prev) => ({ ...prev, color_mode: "light" }))}
                      className="btn btn--sm"
                      style={{
                        background: organizer.color_mode === "light" ? "#ffffff" : "transparent",
                        color: organizer.color_mode === "light" ? "var(--t-base)" : "var(--t-muted)",
                        boxShadow: organizer.color_mode === "light" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <span>☼</span>
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrganizer((prev) => ({ ...prev, color_mode: "dark" }))}
                      className="btn btn--sm"
                      style={{
                        background: organizer.color_mode === "dark" ? "#ffffff" : "transparent",
                        color: organizer.color_mode === "dark" ? "var(--t-base)" : "var(--t-muted)",
                        boxShadow: organizer.color_mode === "dark" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <span>☾</span>
                      <span>Dark</span>
                    </button>
                  </div>

                  {lowContrastWarning && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", color: "#d97706", fontSize: "11px", fontWeight: 500 }}>
                      <span style={{ fontSize: "14px" }}>👁</span>
                      <span>Text may be hard to read</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. Typography Accordion (Screenshot 4) */}
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
                <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: "serif" }}>A</span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--t-base)" }}>Typography</span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--t-light)", transform: openSections.typography ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                ▲
              </span>
            </div>

            {openSections.typography && (
              <div style={{ padding: "16px 18px 20px", borderTop: "1px solid var(--border-soft)", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-base)", display: "block", marginBottom: "2px" }}>
                    Font Family
                  </label>
                  <p style={{ margin: "0 0 8px", fontSize: "11px", color: "var(--t-muted)" }}>
                    Choose a typeface that matches your brand. Fonts are rendered crisp in modern browsers.
                  </p>

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
                </div>

                <div
                  style={{
                    padding: "10px 12px",
                    background: "var(--bg-muted)",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    color: "var(--t-muted)",
                    fontFamily: AVAILABLE_FONTS.find((f) => f.id === organizer.font_family)?.family || "sans-serif",
                  }}
                >
                  The quick brown fox jumps over the lazy dog.
                </div>
              </div>
            )}
          </div>

          {/* Save Action Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn--primary"
            style={{ width: "100%", padding: "12px", fontSize: "13.5px", justifyContent: "center" }}
          >
            {saving ? "Menyimpan Desain..." : saveSuccess ? "✓ Desain Tersimpan!" : "Simpan Perubahan Desain"}
          </button>
        </div>

        {/* Right Column: Live Real-Time Interactive Preview matching Screenshot 2 */}
        <div style={{ position: "sticky", top: "20px" }}>
          {/* Top Preview Banner */}
          <div
            style={{
              padding: "8px 14px",
              background: "#475569",
              color: "#ffffff",
              borderRadius: "10px 10px 0 0",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "11.5px" }}>
              {organizer.is_published ? "This organizer profile is published" : "This organizer profile is not published yet"}
            </span>
            <button
              onClick={() => setOrganizer((prev) => ({ ...prev, is_published: prev.is_published ? 0 : 1 }))}
              style={{
                background: organizer.is_published ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.3)",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "10.5px",
                padding: "3px 8px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>👁</span>
              <span>{organizer.is_published ? "Published" : "Publish"}</span>
            </button>
          </div>

          {/* Embedded Mockup Canvas (Styled dynamically with live props) */}
          <div
            style={{
              background: organizer.bg_color || "#f5f3ff",
              borderRadius: "0 0 14px 14px",
              border: "1px solid var(--border)",
              borderTop: "none",
              padding: "24px 20px",
              minHeight: "520px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              fontFamily: AVAILABLE_FONTS.find((f) => f.id === organizer.font_family)?.family || "sans-serif",
              color: organizer.color_mode === "dark" ? "#f8fafc" : "#0f172a",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            }}
          >
            {/* Organizer Header Card */}
            <div
              style={{
                background: organizer.color_mode === "dark" ? "#1e293b" : "#ffffff",
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
              }}
            >
              {organizer.cover_url && (
                <div style={{ height: "100px", width: "100%", overflow: "hidden" }}>
                  <img src={organizer.cover_url} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}

              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  {organizer.logo_url ? (
                    <img src={organizer.logo_url} alt="Logo" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }} />
                  ) : (
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: organizer.accent_color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: "18px" }}>
                      {(organizer.name || "A")[0].toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h2 style={{ fontSize: "19px", fontWeight: 700, margin: 0, color: organizer.color_mode === "dark" ? "#f8fafc" : "#0f172a" }}>
                      {organizer.name || "art smiot"}
                    </h2>
                    {organizer.bio && (
                      <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: organizer.color_mode === "dark" ? "#94a3b8" : "#64748b" }}>
                        {organizer.bio}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  style={{
                    background: organizer.accent_color || "#8b5cf6",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "7px 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>Contact</span>
                </button>
              </div>
            </div>

            {/* Upcoming Events Card */}
            <div
              style={{
                background: organizer.color_mode === "dark" ? "#1e293b" : "#ffffff",
                borderRadius: "14px",
                padding: "18px 20px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                flex: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: organizer.color_mode === "dark" ? "#f8fafc" : "#0f172a" }}>
                  Upcoming Events
                </h3>

                {/* Tabs [Upcoming] [Past] */}
                <div style={{ display: "flex", background: organizer.color_mode === "dark" ? "#0f172a" : "#f1f5f9", padding: "2px", borderRadius: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("upcoming")}
                    style={{
                      background: previewTab === "upcoming" ? (organizer.accent_color || "#8b5cf6") : "transparent",
                      color: previewTab === "upcoming" ? "#ffffff" : "inherit",
                      border: "none",
                      borderRadius: "5px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Upcoming
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("past")}
                    style={{
                      background: previewTab === "past" ? (organizer.accent_color || "#8b5cf6") : "transparent",
                      color: previewTab === "past" ? "#ffffff" : "inherit",
                      border: "none",
                      borderRadius: "5px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Past
                  </button>
                </div>
              </div>

              {events.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: organizer.color_mode === "dark" ? "#64748b" : "#94a3b8", fontSize: "13px" }}>
                  No upcoming events
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "1px solid rgba(0,0,0,0.06)",
                        background: organizer.color_mode === "dark" ? "#0f172a" : "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: organizer.color_mode === "dark" ? "#f8fafc" : "#0f172a" }}>
                          {ev.title}
                        </div>
                        <div style={{ fontSize: "11px", color: organizer.color_mode === "dark" ? "#94a3b8" : "#64748b", marginTop: "2px" }}>
                          {ev.date} {ev.location ? `· ${ev.location}` : ""}
                        </div>
                      </div>

                      <a
                        href={`/e/${ev.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: organizer.accent_color,
                          color: "#fff",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 600,
                          textDecoration: "none",
                          shrink: 0,
                        }}
                      >
                        Daftar
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer preview */}
            <div style={{ textAlign: "center", fontSize: "10px", color: organizer.color_mode === "dark" ? "#64748b" : "#94a3b8", marginTop: "auto" }}>
              <span>Privacy Policy · Terms of Service</span>
              <div style={{ marginTop: "3px" }}>Planning an event? Try QR Check-in</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
