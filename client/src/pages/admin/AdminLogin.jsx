import React, { useState } from "react";
import { api, setAuthToken } from "../../api";

export function AdminLogin({ onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("fadhli@gmail.com");
  const [password, setPassword] = useState("GrandOpening2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await api.login(email, password);
        setAuthToken(res.token);
        if (onLoginSuccess) {
          onLoginSuccess(res.admin);
        }
      } else {
        const res = await api.registerAdmin(name, email, password);
        setAuthToken(res.token);
        setSuccessMsg("Akun berhasil dibuat! Mengalihkan ke dashboard...");
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(res.admin);
          }
        }, 800);
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Silakan periksa kembali data Anda.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    if (newMode === "register") {
      setName("");
      setEmail("");
      setPassword("");
    } else {
      setEmail("fadhli@gmail.com");
      setPassword("GrandOpening2026!");
    }
  };

  return (
    <div className="auth-shell">
      {/* Adminator Auth Aside Banner */}
      <aside className="auth-aside">
        <div className="auth-brand">
          <div className="logo">
            <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#fff"
                d="M14.747 9.125c.527-1.426 1.736-2.573 3.317-2.573c1.643 0 2.792 1.085 3.318 2.573l6.077 16.867c.186.496.248.931.248 1.147c0 1.209-.992 2.046-2.139 2.046c-1.303 0-1.954-.682-2.264-1.611l-.931-2.915h-8.62l-.93 2.884c-.31.961-.961 1.642-2.232 1.642c-1.24 0-2.294-.93-2.294-2.17c0-.496.155-.868.217-1.023l6.233-16.867zm.34 11.256h5.891l-2.883-8.992h-.062l-2.946 8.992z"
              />
            </svg>
          </div>
          <div className="name">Adminator</div>
        </div>

        <div className="auth-aside-body">
          <span className="auth-aside-eyebrow">QR Event Management</span>
          <h1>Sistem Registrasi & Check-in Acara Modern.</h1>
          <p>
            Kelola data tamu undangan, terbitkan tiket QR code berkeamanan tinggi, dan lakukan pemindaian kehadiran tanpa antrean panjang.
          </p>

          <div className="auth-quote">
            "Sistem presensi tercepat dengan validasi QR audio-visual real-time dan laporan ekspor otomatis."
            <div className="auth-quote-author">
              <div className="av">GO</div>
              <div>Panitia Grand Opening · Jakarta</div>
            </div>
          </div>
        </div>

        <div className="auth-aside-footer">
          <span>© 2026 ADMINATOR</span>
          <span>ENTERPRISE GRADE</span>
        </div>
      </aside>

      {/* Adminator Auth Main Card */}
      <main className="auth-main">
        <div className="auth-card">
          <h2>{mode === "login" ? "Selamat Datang" : "Daftar Akun Baru"}</h2>
          <p className="sub">
            {mode === "login"
              ? "Masuk ke portal Adminator untuk mengelola acara dan kehadiran."
              : "Lengkapi data di bawah ini untuk membuat akun penyelenggara."}
          </p>

          {/* Mode Switcher */}
          <div className="tabs pills" style={{ width: "100%", marginBottom: "20px" }}>
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`tab ${mode === "login" ? "is-active" : ""}`}
              style={{ flex: 1, textAlign: "center" }}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`tab ${mode === "register" ? "is-active" : ""}`}
              style={{ flex: 1, textAlign: "center" }}
            >
              Daftar Baru
            </button>
          </div>

          {error && (
            <div className="alert danger" style={{ marginBottom: "16px" }}>
              <div className="body">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="alert success" style={{ marginBottom: "16px" }}>
              <div className="body">{successMsg}</div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="field">
                <label className="field-label" htmlFor="name">
                  Nama Lengkap <span className="req">*</span>
                </label>
                <div className="input-icon">
                  <span className="ico">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                    </svg>
                  </span>
                  <input
                    id="name"
                    className="input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Penyelenggara"
                  />
                </div>
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor="email">
                Alamat Email <span className="req">*</span>
              </label>
              <div className="input-icon">
                <span className="ico">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>
                <input
                  id="email"
                  className="input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="password">
                Kata Sandi <span className="req">*</span>
              </label>
              <div className="input-icon">
                <span className="ico">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  className="input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button className="btn btn--primary auth-submit" type="submit" disabled={loading}>
              {loading ? (
                "Memproses..."
              ) : mode === "login" ? (
                <>
                  <span>Masuk ke Dashboard</span>
                  <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </>
              ) : (
                <>
                  <span>Daftarkan Akun</span>
                  <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </>
              )}
            </button>
          </form>

          {mode === "login" && (
            <div style={{ marginTop: "20px", padding: "12px", borderRadius: "8px", background: "var(--bg-muted)", border: "1px solid var(--border-soft)", fontSize: "11px", color: "var(--t-muted)" }}>
              <strong style={{ color: "var(--t-base)", display: "block", marginBottom: "4px" }}>
                Default Login Panitia:
              </strong>
              <div className="mono">Email: fadhli@gmail.com</div>
              <div className="mono">Pass: GrandOpening2026!</div>
            </div>
          )}
        </div>

        <div className="auth-main-bottom">
          Grand Opening Event Management System · Built with Adminator
        </div>
      </main>
    </div>
  );
}
