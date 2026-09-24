import React, { useState } from "react";
import { api, setAuthToken } from "../../api";
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("fadhli@gmail.com");
  const [password, setPassword] = useState("GrandOpening2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email, password);
      setAuthToken(res.token);
      if (onLoginSuccess) {
        onLoginSuccess(res.admin);
      }
    } catch (err) {
      setError(err.message || "Email atau kata sandi tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-mesh" />

      <div className="glass-card max-w-md w-full p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center mx-auto text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Portal Admin</h1>
          <p className="text-xs text-slate-400">
            Masuk untuk mengelola acara, scan QR, dan memantau kehadiran
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label" htmlFor="admin-email">
              Email Admin
            </label>
            <div className="relative">
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
          </div>

          <div>
            <label className="input-label" htmlFor="admin-pass">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                id="admin-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk ke Dashboard</span>
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
