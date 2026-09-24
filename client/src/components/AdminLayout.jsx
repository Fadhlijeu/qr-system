import React, { useState } from "react";
import { setAuthToken } from "../api";

export function AdminLayout({
  activeTab,
  setActiveTab,
  admin,
  onLogout,
  currentEvent,
  children
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    setAuthToken(null);
    if (onLogout) onLogout();
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M3 12 12 3l9 9" />
          <path d="M5 10v10h14V10" />
        </svg>
      )
    },
    {
      id: "events",
      label: "Daftar Acara",
      icon: (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      )
    },
    {
      id: "participants",
      label: "Daftar Peserta",
      icon: (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      )
    },
    {
      id: "scanner",
      label: "Scan QR Tamu",
      icon: (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="3" height="3" />
          <rect x="18" y="18" width="3" height="3" />
        </svg>
      )
    },
    {
      id: "locations",
      label: "Lokasi Tersimpan",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )
    },
    {
      id: "design",
      label: "Desain Halaman",
      icon: (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
        </svg>
      )
    },
    {
      id: "settings",
      label: "Pengaturan",
      icon: (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setDrawerOpen(false);
  };

  const initials = admin?.name
    ? admin.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  const publicGuestUrl = currentEvent
    ? `${window.location.origin}/e/${currentEvent.slug}`
    : null;

  return (
    <div className={`shell ${drawerOpen ? "has-drawer-open" : ""}`}>
      {/* Drawer Backdrop for Mobile */}
      <div
        className="drawer-backdrop"
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className="d-sidebar">
        {/* Brand Header */}
        <div className="brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3h-3zM19 19h2v2h-2zM19 14h2M14 19h2" />
            </svg>
          </div>
          <div className="brand-text">
            <div className="brand-name">QR Check-in</div>
            <div className="brand-tag">Registrasi & Check-in</div>
          </div>
        </div>

        {/* Current Event Context Pill */}
        {currentEvent ? (
          <div style={{ padding: "0 10px" }}>
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "var(--bg-muted)",
                border: "1px solid var(--border-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px"
              }}
            >
              <div style={{ minWidth: 0 }}>
                <span
                  style={{
                    fontSize: "9px",
                    fontFamily: "JetBrains Mono, monospace",
                    color: "var(--primary)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    display: "block"
                  }}
                >
                  Acara Aktif
                </span>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--t-base)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {currentEvent.title}
                </div>
              </div>
              <button
                onClick={() => handleNavClick("events")}
                style={{
                  fontSize: "11px",
                  color: "var(--t-light)",
                  textDecoration: "underline",
                  cursor: "pointer"
                }}
              >
                Ganti
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "0 10px" }}>
            <button
              onClick={() => handleNavClick("events")}
              className="btn btn--primary"
              style={{ width: "100%", fontSize: "12px", padding: "7px 10px" }}
            >
              + Buat Acara Baru
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="nav-section">
          <div className="nav-label">Menu Acara</div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-link ${isActive ? "is-active" : ""}`}
                type="button"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Workspace / User Footer */}
        <div className="sidebar-footer">
          <div className="workspace">
            <div className="workspace-avatar">{initials}</div>
            <div className="workspace-text">
              <div className="workspace-name">{admin?.name || "-"}</div>
              <div className="workspace-role">{admin?.email || "-"}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                color: "var(--danger)",
                padding: "6px",
                borderRadius: "6px",
                cursor: "pointer"
              }}
              title="Keluar"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="main">
        {/* Topbar */}
        <header className="d-topbar">
          <div className="crumbs">
            <button
              className="hamburger"
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label="Toggle navigation"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span>Admin</span>
            <svg className="sep" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
            {currentEvent && (
              <>
                <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentEvent.title}
                </span>
                <svg className="sep" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </>
            )}
            <span className="current">
              {navItems.find((n) => n.id === activeTab)?.label || "Dashboard"}
            </span>
          </div>

          <div className="topbar-actions">
            {publicGuestUrl && (
              <a
                href={publicGuestUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn--ghost"
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                <span>Link Registrasi Tamu</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            )}

            {activeTab !== "scanner" && (
              <button
                onClick={() => setActiveTab("scanner")}
                className="btn btn--primary"
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                <span>Scan QR</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Canvas */}
        <main className="content">
          {children}
        </main>

        {/* Footer */}
        <footer className="d-footer">
          <div>© {new Date().getFullYear()} · QR Check-in System</div>
        </footer>
      </div>
    </div>
  );
}
