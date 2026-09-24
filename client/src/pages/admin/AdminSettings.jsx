import React, { useState, useEffect } from "react";
import { api } from "../../api";

export function AdminSettings({ onNavigateToLocations }) {
  const [activeSection, setActiveSection] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "art smiot",
    bio: "Penyelenggara acara resmi & pameran eksklusif.",
    email: "fadhli@gmail.com",
    whatsapp: "081234567890",
    social_instagram: "",
    social_website: "",
    social_linkedin: "",
    social_twitter: "",
    seo_title: "",
    seo_description: "",
    email_template: "Terima kasih telah mendaftar. Simpan tiket QR ini dan tunjukkan kepada panitia di pintu masuk acara.",
    default_capacity: 100,
    google_analytics_id: "",
    meta_pixel_id: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getOrganizerSettings();
      if (res?.organizer) {
        setForm((prev) => ({
          ...prev,
          name: res.organizer.name || prev.name,
          bio: res.organizer.bio || prev.bio,
          social_instagram: res.organizer.social_instagram || "",
          social_website: res.organizer.social_website || "",
          social_linkedin: res.organizer.social_linkedin || "",
          social_twitter: res.organizer.social_twitter || "",
          seo_title: res.organizer.seo_title || "",
          seo_description: res.organizer.seo_description || "",
          email_template: res.organizer.email_template || prev.email_template,
        }));
      }
      if (res?.admin) {
        setForm((prev) => ({
          ...prev,
          email: res.admin.email || prev.email,
        }));
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateOrganizerSettings(form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Gagal menyimpan pengaturan: " + (err.message || "Server error"));
    } finally {
      setSaving(false);
    }
  };

  const navMenuItems = [
    { id: "basic", label: "Basic Information", icon: "ⓘ" },
    { id: "defaults", label: "Event Defaults", icon: "📅" },
    { id: "locations", label: "Address (Saved Venues)", icon: "📍", isAction: true },
    { id: "social", label: "Social Links", icon: "🔗" },
    { id: "emails", label: "Email Templates", icon: "✉" },
  ];

  return (
    <div>
      {/* Hero Header */}
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Konfigurasi · Organizer</span>
          <h1 className="hero-title">Pengaturan Akun & Penyelenggara</h1>
        </div>
      </section>

      {/* Split Menu matching Hi.Events Screenshot 5 */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Sub-nav Sidebar */}
        <div
          className="card"
          style={{
            padding: "8px",
            border: "1px solid var(--border-soft)",
            borderRadius: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {navMenuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === "locations" && onNavigateToLocations) {
                    onNavigateToLocations();
                  } else {
                    setActiveSection(item.id);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 500,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background .15s, color .15s",
                  background: isActive ? "var(--primary-soft)" : "transparent",
                  color: isActive ? "var(--primary)" : "var(--t-base)",
                }}
              >
                <span style={{ fontSize: "14px", shrink: 0 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Form Content */}
        <div className="card" style={{ padding: "28px", border: "1px solid var(--border-soft)", borderRadius: "14px" }}>
          {loading ? (
            <div style={{ padding: "30px 0", textAlign: "center" }}>
              <div className="spinner lg" style={{ margin: "0 auto 12px" }}></div>
              <p style={{ color: "var(--t-muted)", fontSize: "13px" }}>Memuat pengaturan...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Section 1: Basic Information */}
              {activeSection === "basic" && (
                <>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px", color: "var(--t-base)" }}>
                      Basic Information
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "var(--t-muted)", margin: 0 }}>
                      Nama identitas penyelenggara acara dan kontak resmi.
                    </p>
                  </div>

                  <div className="field">
                    <label className="field-label">Nama Organizer / Penyelenggara</label>
                    <input
                      className="input"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Nama brand atau instansi panitia"
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Bio / Deskripsi Profil</label>
                    <textarea
                      className="textarea"
                      rows={3}
                      value={form.bio}
                      onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Ceritakan tentang organisasi atau event yang biasa Anda selenggarakan..."
                    />
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label className="field-label">Email Penyelenggara</label>
                      <input
                        className="input"
                        type="email"
                        value={form.email}
                        readOnly
                        disabled
                        style={{ color: "var(--t-muted)" }}
                      />
                    </div>

                    <div className="field">
                      <label className="field-label">Nomor WhatsApp Panitia</label>
                      <input
                        className="input"
                        type="text"
                        value={form.whatsapp}
                        onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="08xxxxxxxx"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Section 2: Event Defaults */}
              {activeSection === "defaults" && (
                <>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px", color: "var(--t-base)" }}>
                      Event Defaults
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "var(--t-muted)", margin: 0 }}>
                      Pengaturan bawaan saat Anda membuat acara baru.
                    </p>
                  </div>

                  <div className="field">
                    <label className="field-label">Kapasitas Default Tamu</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={form.default_capacity}
                      onChange={(e) => setForm((prev) => ({ ...prev, default_capacity: Number(e.target.value) || 0 }))}
                    />
                    <span className="field-help">0 = tidak terbatas.</span>
                  </div>
                </>
              )}

              {/* Section 3: Social Links */}
              {activeSection === "social" && (
                <>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px", color: "var(--t-base)" }}>
                      Social Links
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "var(--t-muted)", margin: 0 }}>
                      Tautan profil sosial yang ditampilkan pada halaman publik penyelenggara.
                    </p>
                  </div>

                  <div className="field">
                    <label className="field-label">Instagram URL</label>
                    <input
                      className="input"
                      type="url"
                      value={form.social_instagram}
                      onChange={(e) => setForm((prev) => ({ ...prev, social_instagram: e.target.value }))}
                      placeholder="https://instagram.com/username"
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Website Resmi</label>
                    <input
                      className="input"
                      type="url"
                      value={form.social_website}
                      onChange={(e) => setForm((prev) => ({ ...prev, social_website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">LinkedIn URL</label>
                    <input
                      className="input"
                      type="url"
                      value={form.social_linkedin}
                      onChange={(e) => setForm((prev) => ({ ...prev, social_linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                </>
              )}

              {/* Section 4: Email Templates */}
              {activeSection === "emails" && (
                <>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px", color: "var(--t-base)" }}>
                      Email Templates
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "var(--t-muted)", margin: 0 }}>
                      Catatan atau instruksi khusus yang disertakan pada email e-ticket tamu.
                    </p>
                  </div>

                  <div className="field">
                    <label className="field-label">Pesan Konfirmasi E-Ticket</label>
                    <textarea
                      className="textarea"
                      rows={4}
                      value={form.email_template}
                      onChange={(e) => setForm((prev) => ({ ...prev, email_template: e.target.value }))}
                      placeholder="Instruksi kedatangan, dresscode, dsb..."
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" disabled={saving} className="btn btn--primary">
                  {saving ? "Menyimpan..." : saveSuccess ? "✓ Pengaturan Disimpan" : "Simpan Pengaturan"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
