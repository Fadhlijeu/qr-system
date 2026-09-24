import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { TicketCard } from "../../components/TicketCard";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  Ticket
} from "lucide-react";

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
    } catch (err) {
      setError(err.message || "Gagal melakukan pendaftaran. Silakan periksa kembali data Anda.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0f19]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-xs text-slate-400">Memuat formulir registrasi acara...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0f19]">
        <div className="card-pro max-w-md w-full p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Acara Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400">{error}</p>
          <button onClick={loadEventData} className="btn-secondary text-xs">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col justify-center bg-[#0b0f19]">
      <div className="bg-ambient-clean" />

      <div className="max-w-lg w-full mx-auto relative z-10">
        {issuedTicket ? (
          // ================= VIEW: SUCCESS STATE + E-TICKET =================
          <div className="space-y-6">
            <div className="card-pro p-5 text-center space-y-2.5 border-emerald-500/30 bg-emerald-950/15">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Registrasi Berhasil
              </h1>
              <p className="text-xs text-slate-300">
                Terima kasih, <strong>{issuedTicket.name}</strong>. E-Ticket QR Anda telah diterbitkan.
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
          // ================= VIEW: EVENT INFO + REGISTRATION FORM =================
          <div className="space-y-5">
            {/* Event Information Header Card */}
            <div className="card-pro p-6 space-y-3.5 border-white/10">
              <div className="flex items-center gap-2">
                <span className="badge badge-success text-[10px]">
                  ● Pendaftaran Dibuka
                </span>
                {event.remaining_slots !== null && (
                  <span className="text-[11px] text-slate-400">
                    Sisa Kuota: <strong>{event.remaining_slots}</strong>
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {event.title}
                </h1>
                {event.description && (
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Event Meta Badges */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{event.date}</span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate max-w-[200px]">{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form Card */}
            <div className="card-pro p-6 space-y-5">
              <div className="border-b border-white/5 pb-3">
                <h2 className="text-base font-bold text-white">Formulir Peserta</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Isi data di bawah ini untuk mendapatkan tiket masuk QR Code instan.
                </p>
              </div>

              {event.is_full ? (
                <div className="py-6 text-center space-y-2">
                  <p className="text-amber-400 font-semibold text-sm">
                    Mohon maaf, kuota pendaftaran telah terpenuhi.
                  </p>
                  <p className="text-xs text-slate-500">
                    Silakan hubungi pihak panitia penyelenggara.
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
                      placeholder="Contoh: PT Sinergi Abadi / Komunitas"
                      value={formData.organization}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Menerbitkan E-Ticket QR...</span>
                        </>
                      ) : (
                        <span>Daftar & Dapatkan Tiket QR</span>
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
