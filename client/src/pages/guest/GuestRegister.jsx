import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { api } from "../../api";
import { TicketCard } from "../../components/TicketCard";
import { Calendar, Clock, MapPin, Sparkles, AlertCircle, Loader2 } from "lucide-react";

export function GuestRegister({ slug = "grand-opening" }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    organization: "",
  });

  // Successful registration result
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

      // Trigger celebration confetti
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      setError(err.message || "Gagal melakukan pendaftaran. Silakan periksa kembali data Anda.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-sm text-slate-400">Memuat formulir pendaftaran...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold">Acara Tidak Ditemukan</h2>
          <p className="text-sm text-slate-400">{error}</p>
          <button onClick={loadEventData} className="btn-secondary text-sm">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col justify-center">
      <div className="bg-mesh" />

      <div className="container-narrow">
        {issuedTicket ? (
          // ================= VIEW: E-TICKET SUCCESS =================
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Pendaftaran Berhasil
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                E-Ticket QR Anda Siap!
              </h1>
              <p className="text-sm text-slate-300">
                Simpan tiket atau unduh kode QR berikut untuk verifikasi kehadiran di lokasi acara.
              </p>
            </div>

            {/* Ticket Card Component */}
            <TicketCard ticket={issuedTicket} event={event} />

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setIssuedTicket(null);
                  setFormData({ name: "", whatsapp: "", email: "", organization: "" });
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Daftarkan peserta lain
              </button>
            </div>
          </div>
        ) : (
          // ================= VIEW: REGISTRATION FORM =================
          <div className="space-y-6">
            {/* Header Event Summary */}
            <div className="glass-card p-6 md:p-8 space-y-4 text-center relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold">
                <span>Registrasi Acara Resmi</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                {event.title}
              </h1>

              {event.description && (
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  {event.description}
                </p>
              )}

              {/* Event Meta Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-white/5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{event.date}</span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-white/5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{event.time}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-white/5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <div className="glass-card p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white mb-1">Formulir Peserta</h2>
                <p className="text-xs text-slate-400">
                  Lengkapi data di bawah ini untuk mendapatkan E-Ticket dengan QR Code unik.
                </p>
              </div>

              {event.is_full ? (
                <div className="text-center py-6 space-y-2">
                  <p className="text-amber-400 font-semibold text-sm">
                    Mohon maaf, kuota pendaftaran telah terpenuhi.
                  </p>
                  <p className="text-xs text-slate-400">
                    Silakan hubungi panitia untuk informasi lebih lanjut.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="input-label" htmlFor="name">
                      Nama Lengkap <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="input-label" htmlFor="whatsapp">
                      Nomor WhatsApp <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="input-label" htmlFor="email">
                      Alamat Email <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Contoh: budi@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="input-label" htmlFor="organization">
                      Instansi / Organisasi / Perusahaan <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="organization"
                      name="organization"
                      type="text"
                      required
                      placeholder="Contoh: PT Teknologi Bangsa / Mandiri"
                      value={formData.organization}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Menerbitkan Tiket QR...</span>
                        </>
                      ) : (
                        <>
                          <span>Daftar Sekarang & Dapatkan QR Tiket</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
