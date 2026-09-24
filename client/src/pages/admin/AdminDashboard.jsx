import React, { useState, useEffect } from "react";
import { api } from "../../api";

export function AdminDashboard({ eventId, onNavigateToScanner, onNavigateToParticipants, onNavigateToEvents }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    loadDashboardData();
    api.getConfig().then(setConfig).catch(() => {});
  }, [eventId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (eventId) {
        const res = await api.getDashboard(eventId);
        setData(res);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPublicEventUrl = () => {
    if (!data?.event) return "";
    const base = config?.guestDomain || window.location.origin;
    return `${base}/e/${data.event.slug}`;
  };

  const handleCopyLink = () => {
    const url = getPublicEventUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <div className="spinner lg" style={{ margin: "0 auto 16px" }}></div>
        <p style={{ color: "var(--t-muted)", fontSize: "13px" }}>
          Memuat data dashboard...
        </p>
      </div>
    );
  }

  // If no event is created or selected yet
  if (!data?.event) {
    return (
      <div>
        <section className="hero">
          <div className="hero-text">
            <span className="eyebrow" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--primary)" }}>Dashboard</span>
            <h1 className="hero-title">Dashboard Acara</h1>
          </div>
        </section>

        <section className="card" style={{ padding: "48px 32px", textAlign: "center", maxWidth: "600px", margin: "20px auto 40px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--primary-soft)", color: "var(--primary)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 20px", color: "var(--t-base)" }}>
            Belum Ada Acara Aktif
          </h2>
          <button
            onClick={() => onNavigateToEvents && onNavigateToEvents()}
            className="btn btn--primary"
            style={{ margin: "0 auto" }}
          >
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            <span>Buat Acara Baru</span>
          </button>
        </section>
      </div>
    );
  }

  const { metrics, event, recent_checkins = [] } = data;
  const publicUrl = getPublicEventUrl();

  return (
    <div>
      {/* Event display image with full ratio & gradient fadeout touching the event name */}
      {event.image_url ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            borderRadius: "14px 14px 0 0",
            overflow: "hidden",
            background: "var(--bg-muted)",
            aspectRatio: "21 / 8",
            minHeight: "180px",
            maxHeight: "320px",
            marginBottom: "-48px",
            zIndex: 1,
            border: "1px solid var(--border-soft)",
            borderBottom: "none",
          }}
        >
          <img
            src={event.image_url}
            alt={event.title}
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, var(--bg-body, #f8fafc) 0%, rgba(248, 250, 252, 0.88) 30%, transparent 75%)",
              pointerEvents: "none",
            }}
          />
        </div>
      ) : null}

      {/* 1. Hero Header */}
      <section
        className="hero"
        style={{
          position: "relative",
          zIndex: 2,
          background: event.image_url ? "transparent" : undefined,
          paddingTop: event.image_url ? "12px" : undefined,
        }}
      >
        <div className="hero-text">
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
            <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--primary)" }}>Dashboard</span>
            <span>·</span>
            <span>{event.date} {event.time ? `· ${event.time}` : ""}</span>
            {event.location && (
              <>
                <span>·</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Buka lokasi di Google Maps"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "var(--primary)",
                    fontWeight: 600,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{event.location}</span>
                  <span style={{ fontSize: "11px" }}>↗</span>
                </a>
              </>
            )}
          </div>
          <h1 className="hero-title">
            {event.title}
          </h1>
          {event.description && (
            <p className="hero-sub">{event.description}</p>
          )}
        </div>

        <div className="hero-actions">
          <button onClick={handleCopyLink} className="btn btn--ghost">
            {copied ? (
              <>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--success)" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span style={{ color: "var(--success)" }}>Link Tersalin</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Salin Link Tamu</span>
              </>
            )}
          </button>

          <a href={publicUrl} target="_blank" rel="noreferrer" className="btn btn--ghost">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            <span>Buka Form</span>
          </a>

          <button onClick={onNavigateToScanner} className="btn btn--primary">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            <span>Mulai Scan QR</span>
          </button>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="kpi-grid" aria-label="Key metrics">
        {/* Total Registered */}
        <article className="kpi-card c-primary">
          <div className="kpi-top">
            <div className="kpi-icon primary">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
            </div>
            <span className="kpi-pill info">Tamu</span>
          </div>
          <div className="kpi-label" style={{ whiteSpace: "normal", overflow: "visible", fontSize: "13.5px", fontWeight: 600, color: "var(--t-muted)" }}>
            Total Terdaftar
          </div>
          <div className="kpi-value">{metrics?.total_registered || 0}</div>
          <div className="kpi-compare">Total registrasi tamu</div>
        </article>

        {/* Checked In */}
        <article className="kpi-card c-success">
          <div className="kpi-top">
            <div className="kpi-icon success">
              <svg viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="kpi-pill up">Hadir</span>
          </div>
          <div className="kpi-label" style={{ whiteSpace: "normal", overflow: "visible", fontSize: "13.5px", fontWeight: 600, color: "var(--t-muted)" }}>
            Sudah Hadir
          </div>
          <div className="kpi-value">{metrics?.checked_in || 0}</div>
          <div className="kpi-compare">Telah divalidasi masuk</div>
        </article>

        {/* Pending Check-in */}
        <article className="kpi-card c-danger">
          <div className="kpi-top">
            <div className="kpi-icon danger">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span className="kpi-pill down">Pending</span>
          </div>
          <div className="kpi-label" style={{ whiteSpace: "normal", overflow: "visible", fontSize: "13.5px", fontWeight: 600, color: "var(--t-muted)" }}>
            Belum Hadir
          </div>
          <div className="kpi-value">{metrics?.pending_checkin || 0}</div>
          <div className="kpi-compare">Menunggu kedatangan</div>
        </article>

        {/* Attendance Rate */}
        <article className="kpi-card c-purple">
          <div className="kpi-top">
            <div className="kpi-icon purple">
              <svg viewBox="0 0 24 24">
                <line x1="19" y1="5" x2="5" y2="19" />
                <circle cx="6.5" cy="6.5" r="2.5" />
                <circle cx="17.5" cy="17.5" r="2.5" />
              </svg>
            </div>
            <span className="kpi-pill flat">{metrics?.attendance_rate || 0}%</span>
          </div>
          <div className="kpi-label" style={{ whiteSpace: "normal", overflow: "visible", fontSize: "13.5px", fontWeight: 600, color: "var(--t-muted)" }}>
            Persentase Kehadiran
          </div>
          <div className="kpi-value">
            {metrics?.attendance_rate || 0}<sup>%</sup>
          </div>
          <div className="kpi-compare">Rasio kehadiran tamu</div>
        </article>
      </section>

      {/* 3. Bottom Section: Recent Check-ins (Full Width, No Dummy Guide) */}
      <div className="grid">
        <section className="col-12 card">
          <div className="card-head">
            <div className="card-title-wrap">
              <span className="eyebrow">Realtime</span>
              <h2 className="card-title">Kedatangan Terakhir</h2>
            </div>
            <button onClick={onNavigateToParticipants} className="card-action">
              <span>Lihat Semua Peserta</span>
              <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </button>
          </div>

          {recent_checkins.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--t-light)", fontSize: "13px" }}>
              Belum ada tamu yang check-in pada acara ini.
            </div>
          ) : (
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Peserta</th>
                    <th>Kode Tiket</th>
                    <th>Instansi</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Waktu Hadir</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_checkins.map((item, idx) => (
                    <tr key={idx}>
                      <td className="cell-name">{item.name}</td>
                      <td>
                        <span className="mono" style={{ fontSize: "12px", color: "var(--t-base)", fontWeight: 600 }}>
                          {item.ticket_code}
                        </span>
                      </td>
                      <td style={{ color: "var(--t-muted)" }}>{item.organization || "-"}</td>
                      <td>
                        <span className="tag t-active">Hadir</span>
                      </td>
                      <td style={{ textAlign: "right", color: "var(--t-light)", fontSize: "12px" }}>
                        {item.checkin_time
                          ? new Date(item.checkin_time).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "Baru saja"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
