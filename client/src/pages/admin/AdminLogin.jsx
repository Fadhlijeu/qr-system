import React, { useState, useEffect } from "react";
import { api, setAuthToken } from "../../api";

/**
 * Compact alert box shared by every auth step.
 * `.alert` is a 3-column grid (icon | message | close), so the message has to
 * live inside `.body`; text placed directly as a grid child is squeezed into
 * the 24px icon column and wraps one word per line.
 */
function Alert({ tone = "danger", children }) {
  return (
    <div className={`alert ${tone}`} style={{ marginBottom: "16px" }}>
      <span className="ico">
        <svg viewBox="0 0 24 24">
          {tone === "success" ? (
            <path d="M20 6 9 17l-5-5" />
          ) : (
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5V13M12 16.5v.01" />
            </>
          )}
        </svg>
      </span>
      <div className="body" style={{ fontSize: "13px" }}>{children}</div>
    </div>
  );
}

export function AdminLogin({ onLoginSuccess }) {
  // 'login' | 'register_form' | 'register_otp'
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [devMode, setDevMode] = useState(false); // true if SMTP not configured
  // Server feature flag: admin self-registration via e-mail OTP can be switched
  // off without removing the flow (`ENABLE_ADMIN_OTP_REGISTRATION`).
  const [otpRegistrationEnabled, setOtpRegistrationEnabled] = useState(null);

  // ── Feature flags ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    api
      .getConfig()
      .then((res) => {
        if (!cancelled) setOtpRegistrationEnabled(res?.adminOtpRegistrationEnabled !== false);
      })
      .catch(() => {
        // Config not reachable: keep the UI untouched, the register endpoints
        // answer with a clear message on their own.
        if (!cancelled) setOtpRegistrationEnabled(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setAuthToken(res.token);
      if (onLoginSuccess) onLoginSuccess(res.admin);
    } catch (err) {
      setError(err.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  // ── Register Step 1: request OTP ───────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.requestOtp(name, email, password);
      setDevMode(res.devMode === true);
      setMode("register_otp");
      setSuccessMsg(res.message);
    } catch (err) {
      setError(err.message || "Gagal mengirim OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Register Step 2: verify OTP ───────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.verifyOtp(email, otp);
      setAuthToken(res.token);
      if (onLoginSuccess) onLoginSuccess(res.admin);
    } catch (err) {
      setError(err.message || "OTP salah atau sudah kadaluarsa.");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    setMode("login");
    setError(null);
    setSuccessMsg(null);
    setOtp("");
  };

  const goToRegister = () => {
    setMode("register_form");
    setError(null);
    setSuccessMsg(null);
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="auth-shell" style={{ gridTemplateColumns: "1fr" }}>
      {/* ── Centered auth card (no aside) ── */}
      <main className="auth-main" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="auth-card" style={{ width: "100%", maxWidth: "420px" }}>

          {/* Brand mark */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--primary)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" width="20" height="20">
                <path fill="#fff" d="M14.747 9.125c.527-1.426 1.736-2.573 3.317-2.573c1.643 0 2.792 1.085 3.318 2.573l6.077 16.867c.186.496.248.931.248 1.147c0 1.209-.992 2.046-2.139 2.046c-1.303 0-1.954-.682-2.264-1.611l-.931-2.915h-8.62l-.93 2.884c-.31.961-.961 1.642-2.232 1.642c-1.24 0-2.294-.93-2.294-2.17c0-.496.155-.868.217-1.023l6.233-16.867zm.34 11.256h5.891l-2.883-8.992h-.062l-2.946 8.992z" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--t-base)" }}>QR Check-in</div>
              <div style={{ fontSize: "11px", color: "var(--t-muted)" }}>Admin Portal</div>
            </div>
          </div>

          {/* ═══════════════════ LOGIN MODE ═══════════════════ */}
          {mode === "login" && (
            <>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>Selamat Datang</h2>
              <p style={{ fontSize: "13px", color: "var(--t-muted)", marginBottom: "20px" }}>
                Masuk ke portal admin untuk mengelola acara.
              </p>

              {error && <Alert tone="danger">{error}</Alert>}

              <form className="auth-form" onSubmit={handleLogin}>
                <div className="field">
                  <label className="field-label" htmlFor="login-email">Email</label>
                  <div className="input-icon">
                    <span className="ico">
                      <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                    </span>
                    <input
                      id="login-email"
                      className="input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Alamat email"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="login-password">Kata Sandi</label>
                  <div className="input-icon">
                    <span className="ico">
                      <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </span>
                    <input
                      id="login-password"
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
                  {loading ? "Memverifikasi..." : <><span>Masuk</span><svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7" /></svg></>}
                </button>
              </form>

              {otpRegistrationEnabled === false ? (
                <p style={{ marginTop: "20px", textAlign: "center", fontSize: "12.5px", color: "var(--t-muted)" }}>
                  Pendaftaran akun admin lewat OTP email sedang dinonaktifkan sementara.
                </p>
              ) : (
                <p style={{ marginTop: "20px", textAlign: "center", fontSize: "12.5px", color: "var(--t-muted)" }}>
                  Belum punya akun?{" "}
                  <button type="button" onClick={goToRegister} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontWeight: 600, padding: 0 }}>
                    Daftar Sekarang
                  </button>
                </p>
              )}
            </>
          )}

          {/* ═══════════════════ REGISTER FORM ═══════════════════ */}
          {mode === "register_form" && (
            <>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>Daftar Akun Admin</h2>
              <p style={{ fontSize: "13px", color: "var(--t-muted)", marginBottom: "20px" }}>
                Kami akan mengirim kode OTP ke email Anda untuk verifikasi.
              </p>

              {error && <Alert tone="danger">{error}</Alert>}

              <form className="auth-form" onSubmit={handleRequestOtp}>
                <div className="field">
                  <label className="field-label" htmlFor="reg-name">Nama Lengkap <span className="req">*</span></label>
                  <div className="input-icon">
                    <span className="ico">
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>
                    </span>
                    <input
                      id="reg-name"
                      className="input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Penyelenggara"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="reg-email">Email <span className="req">*</span></label>
                  <div className="input-icon">
                    <span className="ico">
                      <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                    </span>
                    <input
                      id="reg-email"
                      className="input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Alamat email"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="reg-password">Kata Sandi <span className="req">*</span></label>
                  <div className="input-icon">
                    <span className="ico">
                      <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </span>
                    <input
                      id="reg-password"
                      className="input"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 karakter"
                    />
                  </div>
                </div>

                <button className="btn btn--primary auth-submit" type="submit" disabled={loading}>
                  {loading ? "Mengirim OTP..." : <><span>Kirim Kode OTP</span><svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7" /></svg></>}
                </button>
              </form>

              <p style={{ marginTop: "20px", textAlign: "center", fontSize: "12.5px", color: "var(--t-muted)" }}>
                Sudah punya akun?{" "}
                <button type="button" onClick={goToLogin} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontWeight: 600, padding: 0 }}>
                  Masuk
                </button>
              </p>
            </>
          )}

          {/* ═══════════════════ OTP VERIFICATION ═══════════════════ */}
          {mode === "register_otp" && (
            <>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>Verifikasi Email</h2>
              <p style={{ fontSize: "13px", color: "var(--t-muted)", marginBottom: "6px" }}>
                Kode OTP 6 digit telah dikirim ke:
              </p>
              <div style={{ background: "var(--bg-muted)", padding: "8px 12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: 600, color: "var(--primary)" }}>
                {email}
              </div>

              {devMode && (
                <Alert tone="warning">
                  <strong>Mode Dev:</strong> SMTP belum dikonfigurasi, kode OTP tercetak di console server.
                </Alert>
              )}

              {successMsg && !error && <Alert tone="success">{successMsg}</Alert>}

              {error && <Alert tone="danger">{error}</Alert>}

              <form className="auth-form" onSubmit={handleVerifyOtp}>
                <div className="field">
                  <label className="field-label" htmlFor="otp-input">Kode OTP <span className="req">*</span></label>
                  <input
                    id="otp-input"
                    className="input mono"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="______"
                    autoFocus
                    style={{ letterSpacing: "0.3em", fontSize: "20px", textAlign: "center", fontWeight: 700 }}
                  />
                  <span className="field-help">Berlaku 10 menit. Jangan tutup halaman ini.</span>
                </div>

                <button className="btn btn--primary auth-submit" type="submit" disabled={loading || otp.length !== 6}>
                  {loading ? "Memverifikasi..." : <><span>Verifikasi &amp; Buat Akun</span><svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7" /></svg></>}
                </button>
              </form>

              <p style={{ marginTop: "16px", textAlign: "center", fontSize: "12.5px", color: "var(--t-muted)" }}>
                Tidak menerima email?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("register_form"); setError(null); setSuccessMsg(null); }}
                  style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontWeight: 600, padding: 0 }}
                >
                  Kirim ulang
                </button>
              </p>
              <p style={{ textAlign: "center", fontSize: "12.5px", color: "var(--t-muted)" }}>
                <button type="button" onClick={goToLogin} style={{ background: "none", border: "none", color: "var(--t-light)", cursor: "pointer", padding: 0 }}>
                  ← Kembali ke Login
                </button>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
