import React, { useState, useEffect } from "react";
import { api } from "../../api";

export function GuestOrganizer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    api
      .getPublicOrganizer()
      .then(setData)
      .catch((err) => console.error("Gagal memuat profil penyelenggara:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner lg" style={{ margin: "0 auto 12px" }}></div>
          <p style={{ color: "#64748b", fontSize: "13px" }}>Memuat profil penyelenggara...</p>
        </div>
      </div>
    );
  }

  const organizer = data?.organizer || {};
  const events = data?.events || [];
  const isDark = organizer.color_mode === "dark";
  const bg = organizer.bg_color || "#f8fafc";
  const accent = organizer.accent_color || "#8b5cf6";
  const font = organizer.font_family ? `'${organizer.font_family}', sans-serif` : "sans-serif";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        fontFamily: font,
        color: isDark ? "#f8fafc" : "#0f172a",
        padding: "32px 16px 64px",
      }}
    >
      <div style={{ maxWidth: "780px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Organizer Header Card */}
        <div
          style={{
            background: isDark ? "#1e293b" : "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {organizer.cover_url && (
            <div style={{ height: "160px", width: "100%", overflow: "hidden", background: "#334155" }}>
              <img src={organizer.cover_url} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {organizer.logo_url ? (
                <img
                  src={organizer.logo_url}
                  alt="Logo"
                  style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "3px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
                />
              ) : (
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: accent,
                    color: "#ffffff",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: "24px",
                  }}
                >
                  {(organizer.name || "A")[0].toUpperCase()}
                </div>
              )}

              <div>
                <h1 style={{ fontSize: "24px", fontWeight: 800, margin: 0, color: isDark ? "#f8fafc" : "#0f172a" }}>
                  {organizer.name || "Penyelenggara Acara"}
                </h1>
                {organizer.bio && (
                  <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: isDark ? "#94a3b8" : "#64748b" }}>
                    {organizer.bio}
                  </p>
                )}
              </div>
            </div>

            {organizer.social_website && (
              <a
                href={organizer.social_website}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: accent,
                  color: "#fff",
                  padding: "9px 18px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                Website Resmi ↗
              </a>
            )}
          </div>
        </div>

        {/* Events Section */}
        <div
          style={{
            background: isDark ? "#1e293b" : "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: isDark ? "#f8fafc" : "#0f172a" }}>
              Daftar Acara
            </h2>

            <div style={{ display: "flex", background: isDark ? "#0f172a" : "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
              <button
                type="button"
                onClick={() => setTab("upcoming")}
                style={{
                  background: tab === "upcoming" ? accent : "transparent",
                  color: tab === "upcoming" ? "#ffffff" : "inherit",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Upcoming Events
              </button>
              <button
                type="button"
                onClick={() => setTab("past")}
                style={{
                  background: tab === "past" ? accent : "transparent",
                  color: tab === "past" ? "#ffffff" : "inherit",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Past Events
              </button>
            </div>
          </div>

          {events.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: isDark ? "#64748b" : "#94a3b8", fontSize: "14px" }}>
              Belum ada acara yang dijadwalkan saat ini.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {events.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "12px",
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: isDark ? "#0f172a" : "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px", color: isDark ? "#f8fafc" : "#0f172a" }}>
                      {ev.title}
                    </h3>
                    <div style={{ fontSize: "12.5px", color: isDark ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span>📅 {ev.date} {ev.time ? `· ${ev.time}` : ""}</span>
                      {ev.location && <span>📍 {ev.location}</span>}
                    </div>
                  </div>

                  <a
                    href={`/e/${ev.slug}`}
                    style={{
                      background: accent,
                      color: "#ffffff",
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 700,
                      textDecoration: "none",
                      shrink: 0,
                    }}
                  >
                    Daftar Acara →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "11px", color: isDark ? "#64748b" : "#94a3b8" }}>
          <span>© {new Date().getFullYear()} {organizer.name || "Organizer"}. Hak cipta dilindungi.</span>
          <div style={{ marginTop: "4px" }}>Powered by QR Grand Opening Check-in System</div>
        </div>
      </div>
    </div>
  );
}
