import React, { useState } from "react";
import { api, setAuthToken } from "../../api";
import { ShieldCheck, UserPlus, Lock, Mail, User, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-mesh" />

      <div className="glass-card max-w-md w-full p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center mx-auto text-indigo-400">
            {mode === "login" ? <ShieldCheck className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {mode === "login" ? "Portal Admin" : "Daftar Akun Admin"}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === "login"
              ? "Masuk untuk mengelola acara, scan QR, dan memantau kehadiran"
              : "Buat akun panitia / admin baru untuk mengelola acara Anda"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              mode === "login" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              mode === "register" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Daftar Admin Baru
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="input-label" htmlFor="admin-name">
                Nama Lengkap / Instansi
              </label>
              <input
                id="admin-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Contoh: Panitia Grand Opening"
              />
            </div>
          )}

          <div>
            <label className="input-label" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="admin-pass">
              Kata Sandi
            </label>
            <input
              id="admin-pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : mode === "login" ? (
              <span>Masuk ke Dashboard</span>
            ) : (
              <span>Buat Akun & Masuk</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          QR Event Management System &copy; 2026
        </div>
      </div>
    </div>
  );
}
