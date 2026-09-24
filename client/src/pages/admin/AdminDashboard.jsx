import React, { useState, useEffect } from "react";
import { api } from "../../api";
import {
  Users,
  UserCheck,
  Clock,
  Percent,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  ArrowRight,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2
} from "lucide-react";

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

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="card-pro p-6 space-y-4">
          <div className="h-6 w-1/3 skeleton" />
          <div className="h-4 w-1/2 skeleton" />
        </div>
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-pro p-5 space-y-3">
              <div className="h-4 w-20 skeleton" />
              <div className="h-8 w-14 skeleton" />
            </div>
          ))}
        </div>
        <div className="card-pro p-6 h-64 skeleton" />
      </div>
    );
  }

  if (!data?.event) {
    return (
      <div className="card-pro p-10 text-center space-y-3">
        <p className="text-slate-400 text-sm">Acara tidak ditemukan.</p>
      </div>
    );
  }

  const { metrics, event, recent_checkins = [] } = data;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="card-pro p-5 md:p-6 bg-gradient-to-r from-[#131b2e] via-[#111827] to-[#0f172a] border border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="badge badge-success text-[10px]">
                ● {event.status === "ACTIVE" ? "Acara Aktif" : "Selesai"}
              </span>
              <span className="text-xs text-indigo-400 font-mono">
                /e/{event.slug}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{event.date} {event.time && `· ${event.time}`}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Copy Link & Open Event */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyLink}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Link Pendaftaran</span>
                </>
              )}
            </button>

            <a
              href={`/e/${event.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <span>Buka Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Four Attendance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Registered */}
        <div className="card-pro p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Total Terdaftar</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-display">
            {metrics.registered}
          </div>
          <p className="text-[11px] text-slate-400">
            {event.capacity > 0 ? `Kapasitas: ${event.capacity} peserta` : "Kapasitas tanpa batas"}
          </p>
        </div>

        {/* Metric 2: Checked In */}
        <div className="card-pro p-5 space-y-2 border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Sudah Hadir</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 font-display">
            {metrics.checked_in}
          </div>
          <p className="text-[11px] text-emerald-400/80">
            Verifikasi tiket sukses
          </p>
        </div>

        {/* Metric 3: Not Checked In */}
        <div className="card-pro p-5 space-y-2 border-amber-500/20 bg-amber-950/10">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Belum Hadir</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-amber-400 font-display">
            {metrics.not_checked_in}
          </div>
          <p className="text-[11px] text-amber-400/80">
            Menunggu kedatangan
          </p>
        </div>

        {/* Metric 4: Attendance Rate */}
        <div className="card-pro p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Persentase Kehadiran</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-display">
            {metrics.attendance_percentage}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.attendance_percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Quick Action Banner for Scanner */}
      <div className="card-pro p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 to-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              Verifikasi Tamu dengan QR Scanner
            </h3>
            <p className="text-xs text-slate-400">
              Gunakan kamera ponsel atau laptop untuk check-in instan di pintu masuk acara.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToScanner}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-2 shrink-0 w-full sm:w-auto"
        >
          <span>Mulai Scan QR</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Recent Check-ins List */}
      <div className="card-pro overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-white text-sm">
              Kehadiran Terkini
            </h2>
          </div>
          <button
            onClick={onNavigateToParticipants}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            Lihat Semua Peserta →
          </button>
        </div>

        {recent_checkins.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-sm font-medium">
              Belum ada peserta yang check-in pada acara ini.
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan tiket QR peserta menggunakan menu QR Scanner untuk mencatat kehadiran secara langsung.
            </p>
            <button
              onClick={onNavigateToScanner}
              className="btn-secondary text-xs mt-2"
            >
              <QrCode className="w-3.5 h-3.5" /> Buka QR Scanner
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recent_checkins.map((item) => {
              const initials = item.name
                ? item.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "P";

              return (
                <div
                  key={item.id}
                  className="p-3.5 md:px-5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-white text-xs block truncate">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {item.organization && (
                          <span className="truncate max-w-[150px]">{item.organization}</span>
                        )}
                        {item.email && (
                          <>
                            <span className="text-slate-600 hidden sm:inline">·</span>
                            <span className="truncate hidden sm:inline">{item.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <span className="font-mono text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                      {item.ticket_code}
                    </span>
                    <div className="hidden sm:block text-[11px] text-slate-400 font-mono">
                      {item.checked_in_at ? item.checked_in_at.substring(11, 16) + " WIB" : "-"}
                    </div>
                    <span className="badge badge-success text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Hadir
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
