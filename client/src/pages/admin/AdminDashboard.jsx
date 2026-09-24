import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { Users, UserCheck, Clock, Percent, Copy, Check, ExternalLink, QrCode, ArrowUpRight } from "lucide-react";

export function AdminDashboard({ eventId, onNavigateToScanner, onNavigateToParticipants }) {
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
      const res = await api.getDashboard(eventId);
      setData(res);
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

  if (loading || !data) {
    return (
      <div className="py-12 text-center text-slate-400">
        Memuat data dashboard...
      </div>
    );
  }

  const { metrics, event, recent_checkins } = data;

  return (
    <div className="space-y-6">
      {/* Event Share Link Banner */}
      <div className="glass-card p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-500/20 bg-indigo-950/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge badge-success text-[10px]">Event Aktif</span>
            <h2 className="font-bold text-white text-base">{event.title}</h2>
          </div>
          <p className="text-xs text-slate-300">
            Link pendaftaran peserta: <code className="text-indigo-300 font-mono">{getPublicEventUrl()}</code>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleCopyLink}
            className="btn-secondary text-xs flex-1 md:flex-initial py-2 flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Link</span>
              </>
            )}
          </button>
          <a
            href={`/e/${event.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary text-xs flex-1 md:flex-initial py-2 flex items-center justify-center gap-1.5"
          >
            <span>Buka Form</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered */}
        <div className="glass-card p-5 space-y-2 border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Terdaftar</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {metrics.registered}
          </div>
          <p className="text-[11px] text-slate-400">
            {event.capacity > 0 ? `Kapasitas: ${event.capacity} peserta` : "Kapasitas tanpa batas"}
          </p>
        </div>

        {/* Card 2: Checked In */}
        <div className="glass-card p-5 space-y-2 border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Sudah Hadir</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {metrics.checked_in}
          </div>
          <p className="text-[11px] text-emerald-400/80">
            Check-in berhasil
          </p>
        </div>

        {/* Card 3: Not Checked In */}
        <div className="glass-card p-5 space-y-2 border-amber-500/20 bg-amber-950/10">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Belum Hadir</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {metrics.not_checked_in}
          </div>
          <p className="text-[11px] text-amber-400/80">
            Menunggu kedatangan
          </p>
        </div>

        {/* Card 4: Attendance Rate */}
        <div className="glass-card p-5 space-y-2 border-purple-500/20 bg-purple-950/10">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Persentase Kehadiran</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">
            {metrics.attendance_percentage}%
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.attendance_percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={onNavigateToScanner}
          className="glass-card p-5 cursor-pointer glass-card-hover border-indigo-500/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Buka QR Scanner</h3>
              <p className="text-xs text-slate-400">Verifikasi tiket peserta via kamera laptop / HP</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={onNavigateToParticipants}
          className="glass-card p-5 cursor-pointer glass-card-hover border-white/10 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Kelola Daftar Peserta</h3>
              <p className="text-xs text-slate-400">Lihat semua tamu, cari nama, atau export CSV</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="glass-card p-5 border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Kehadiran Terkini</span>
          </h3>
          <span className="text-xs text-slate-400">
            {recent_checkins.length} check-in terakhir
          </span>
        </div>

        {recent_checkins.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Belum ada check-in hari ini. Gunakan menu <strong>QR Scanner</strong> untuk mulai scan tiket peserta.
          </div>
        ) : (
          <div className="space-y-2">
            {recent_checkins.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs hover:border-white/10 transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">{item.name}</span>
                  <span className="text-slate-400">{item.organization}</span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="font-mono font-bold text-indigo-400 block">
                    {item.ticket_code}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {item.checked_in_at ? item.checked_in_at.substring(11, 16) : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
