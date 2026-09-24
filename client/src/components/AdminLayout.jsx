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
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 10.5 9-7 9 7v10.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20.5z" />
          <path d="M9 22V12h6v10" />
        </svg>
      )
    },
    {
      id: "events",
      label: "Daftar Acara",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2.5" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      id: "participants",
      label: "Daftar Peserta",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="7" r="4" />
          <path d="M3 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
        </svg>
      )
    },
    {
      id: "scanner",
      label: "Scan QR Tamu",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8V5a2 2 0 0 1 2-2h3" />
          <path d="M15 3h3a2 2 0 0 1 2 2v3" />
          <path d="M20 16v3a2 2 0 0 1-2 2h-3" />
          <path d="M9 21H6a2 2 0 0 1-2-2v-3" />
          <rect x="7" y="7" width="3.5" height="3.5" rx="0.5" />
          <rect x="13.5" y="7" width="3.5" height="3.5" rx="0.5" />
          <rect x="7" y="13.5" width="3.5" height="3.5" rx="0.5" />
          <rect x="13.5" y="13.5" width="3.5" height="3.5" rx="0.5" />
        </svg>
      )
    },
    {
      id: "locations",
      label: "Lokasi Tersimpan",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21.5C7.5 16 5 12.5 5 9a7 7 0 0 1 14 0c0 3.5-2.5 7-7 12.5z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      )
    },
    {
      id: "design",
      label: "Desain Tampilan Tamu",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.52-4.48-10-10-10z" />
          <circle cx="8" cy="11.5" r="1.5" />
          <circle cx="9.5" cy="7.5" r="1.5" />
          <circle cx="14.5" cy="7.5" r="1.5" />
          <circle cx="16" cy="11.5" r="1.5" />
        </svg>
      )
    },
    {
      id: "settings",
      label: "Pengaturan",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
        <nav className="nav-section" style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <div
            className="nav-label"
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--t-light, #94a3b8)",
              padding: "6px 12px 6px",
              textAlign: "left",
            }}
          >
            Menu Acara
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-link ${isActive ? "is-active" : ""}`}
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  textAlign: "left",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  fontWeight: isActive ? 600 : 500,
                  gap: "12px",
                  lineHeight: 1.25,
                  cursor: "pointer",
                  background: isActive ? "var(--primary-soft, #eff6ff)" : "transparent",
                  color: isActive ? "var(--primary, #2563eb)" : "var(--t-muted, #475569)",
                  border: "none",
                  borderLeft: isActive ? "3.5px solid var(--primary, #2563eb)" : "3.5px solid transparent",
                  transition: "all 0.16s ease",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    width: "20px",
                    height: "20px",
                    color: isActive ? "var(--primary, #2563eb)" : "currentColor",
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    textAlign: "left",
                    flex: 1,
                    minWidth: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.label}
                </span>
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
