import React, { useState } from "react";
import { Calendar, Clock, MapPin, Users, Copy, Check, ExternalLink, Edit3, ArrowUpRight } from "lucide-react";

export function EventCard({
  event,
  isSelected,
  onSelect,
  onEdit,
  guestBaseUrl,
}) {
  const [copied, setCopied] = useState(false);

  // Format date to extract Day and Month
  let day = "24";
  let month = "OKT";
  try {
    if (event.date) {
      const d = new Date(event.date);
      if (!isNaN(d.getTime())) {
        day = d.getDate();
        month = d.toLocaleString("id-ID", { month: "short" }).toUpperCase();
      }
    }
  } catch (e) {}

  const guestUrl = `${guestBaseUrl || window.location.origin}/e/${event.slug}`;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(guestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onSelect}
      className={`card-pro overflow-hidden cursor-pointer transition-all duration-200 flex flex-col ${
        isSelected
          ? "border-indigo-500/60 ring-1 ring-indigo-500/40 bg-[#162038]"
          : "hover:border-slate-700 hover:bg-[#151e33]"
      }`}
    >
      {/* Top Banner / Cover */}
      <div className="relative h-28 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950 p-4 flex items-start justify-between border-b border-white/5 overflow-hidden">
        {/* Subtle patterned background decoration */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Date Stamp Badge (Hi.Events signature style) */}
        <div className="relative z-10 w-12 h-14 bg-slate-900/90 border border-white/10 rounded-lg flex flex-col items-center justify-center text-center shadow-md">
          <span className="text-[10px] font-bold uppercase text-indigo-400 font-mono tracking-wider">
            {month}
          </span>
          <span className="text-base font-extrabold text-white leading-none font-display">
            {day}
          </span>
        </div>

        {/* Status Pill & Edit Button */}
        <div className="relative z-10 flex items-center gap-1.5">
          <span
            className={`badge ${
              event.status === "ACTIVE" ? "badge-success" : "badge-neutral"
            }`}
          >
            ● {event.status === "ACTIVE" ? "Aktif" : "Selesai"}
          </span>

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              className="p-1.5 rounded-lg bg-slate-900/70 text-slate-400 hover:text-white border border-white/10 transition-colors"
              title="Edit Acara"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-base leading-snug truncate">
              {event.title}
            </h3>
          </div>
          <span className="text-[11px] text-indigo-400 font-mono block mt-0.5">
            /e/{event.slug}
          </span>

          {/* Metadata */}
          <div className="mt-3 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {event.date} {event.time && `· ${event.time}`}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats & Actions Footer */}
        <div className="pt-3 border-t border-white/5 space-y-3">
          {/* Attendees Summary */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>
                <strong>{event.total_registered || 0}</strong> terdaftar
                <span className="text-slate-500 mx-1">·</span>
                <span className="text-emerald-400 font-medium">
                  {event.total_checked_in || 0} hadir
                </span>
              </span>
            </div>
            {event.capacity > 0 && (
              <span className="text-[11px] text-slate-400">
                Maks: {event.capacity}
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSelect}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <span>{isSelected ? "Sedang Dipilih" : "Buka Acara"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopy}
              className="btn-secondary py-1.5 px-2.5 text-xs shrink-0"
              title="Salin Link Pendaftaran Tamu"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Tersalin
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="w-3.5 h-3.5" /> Link
                </span>
              )}
            </button>

            <a
              href={`/e/${event.slug}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn-secondary py-1.5 px-2.5 text-xs shrink-0"
              title="Buka Form Tamu Langsung"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
