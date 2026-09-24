import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { TicketCard } from "../../components/TicketCard";

export function GuestRegister({ slug = "grand-opening" }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    organization: "",
  });

  const [issuedTicket, setIssuedTicket] = useState(null);

  useEffect(() => {
    loadEventData();
  }, [slug]);

  const loadEventData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPublicEvent(slug);
      setEvent(data.event);
    } catch (err) {
      setError(err.message || "Gagal memuat informasi acara.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.registerGuest(slug, formData);
      setIssuedTicket(res.participant);
    } catch (err) {
      setError(err.message || "Gagal melakukan pendaftaran. Silakan periksa kembali data Anda.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-body)", padding: "20px" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner lg" style={{ margin: "0 auto 16px" }}></div>
          <p style={{ color: "var(--t-muted)", fontSize: "13px" }}>Memuat formulir pendaftaran acara...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-body)", padding: "20px" }}>
        <div className="card" style={{ maxWidth: "440px", width: "100%", textAlign: "center", padding: "40px 24px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--danger-soft)", color: "var(--danger)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px", color: "var(--t-base)" }}>
            Acara Tidak Ditemukan
          </h2>
          <p style={{ color: "var(--t-muted)", fontSize: "13px", margin: "0 0 20px" }}>{error}</p>
          <button onClick={loadEventData} className="btn btn--ghost" style={{ width: "100%", justifyContent: "center" }}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-body)", padding: "40px 16px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {issuedTicket ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="alert success">
              <div className="ico">
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div className="body">
                <div className="title">Pendaftaran Berhasil!</div>
                <div>
                  E-Ticket QR code resmi Anda telah dibuat. Silakan download gambar QR atau simpan halaman ini untuk ditunjukkan saat kedatangan di lokasi.
                </div>
              </div>
            </div>

            <TicketCard ticket={issuedTicket} event={event} />

            <div style={{ textAlign: "center", paddingTop: "8px" }}>
              <button
                onClick={() => {
                  setIssuedTicket(null);
                  setFormData({ name: "", whatsapp: "", email: "", organization: "" });
                }}
                className="btn btn--ghost"
                style={{ fontSize: "12px" }}
              >
                Daftarkan Tamu Lainnya
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Event Summary Card */}
            <div className="card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span className="eyebrow" style={{ color: "var(--primary)" }}>
                  Undangan Resmi
                </span>
                <span className="badge success dot">Pendaftaran Terbuka</span>
              </div>

              <h1 style={{ fontSize: "26px", fontWeight: 700, margin: "0 0 8px", color: "var(--t-base)", letterSpacing: "-0.02em" }}>
                {event?.title}
              </h1>

              {event?.description && (
                <p style={{ color: "var(--t-muted)", fontSize: "13.5px", lineHeight: 1.6, margin: "0 0 16px" }}>
                  {event.description}
                </p>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", borderTop: "1px solid var(--border-soft)", paddingTop: "14px", fontSize: "12.5px", color: "var(--t-base)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <span>{event?.date} {event?.time ? `· ${event.time}` : ""}</span>
                </div>

                {event?.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Form Card */}
            <div className="card" style={{ padding: "28px" }}>
              <div style={{ borderBottom: "1px solid var(--border-soft)", paddingBottom: "14px", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px", color: "var(--t-base)" }}>
                  Formulir Registrasi Tamu
                </h2>
                <p style={{ margin: 0, color: "var(--t-muted)", fontSize: "13px" }}>
                  Isi data di bawah ini untuk mendapatkan tiket QR resmi secara instan tanpa perlu akun.
                </p>
              </div>

              {error && (
                <div className="alert danger" style={{ marginBottom: "16px" }}>
                  <div className="body">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="field">
                  <label className="field-label">
                    Nama Lengkap <span className="req">*</span>
                  </label>
                  <div className="input-icon">
                    <span className="ico">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                      </svg>
                    </span>
                    <input
                      className="input"
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Contoh: Raden Wijaya"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label className="field-label">
                      Nomor WhatsApp <span className="req">*</span>
                    </label>
                    <div className="input-icon">
                      <span className="ico">
                        <svg viewBox="0 0 24 24">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </span>
                      <input
                        className="input"
                        type="tel"
                        name="whatsapp"
                        required
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="08123456789"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">Email</label>
                    <div className="input-icon">
                      <span className="ico">
                        <svg viewBox="0 0 24 24">
                          <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
                        </svg>
                      </span>
                      <input
                        className="input"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tamu@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Instansi / Perusahaan</label>
                  <div className="input-icon">
                    <span className="ico">
                      <svg viewBox="0 0 24 24">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </span>
                    <input
                      className="input"
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="Contoh: PT Maju Bersama / Pribadi"
                    />
                  </div>
                </div>

                <div style={{ paddingTop: "8px" }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn--primary"
                    style={{ width: "100%", justifyContent: "center", padding: "12px 18px", fontSize: "14px" }}
                  >
                    {submitting ? "Menerbitkan E-Ticket..." : "Daftar & Dapatkan E-Ticket"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <footer style={{ textAlign: "center", padding: "32px 0 16px", color: "var(--t-light)", fontSize: "12px" }}>
        Grand Opening · Adminator QR Event System
      </footer>
    </div>
  );
}
