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
      className={`card-hi overflow-hidden cursor-pointer transition-all duration-150 flex flex-col ${
        isSelected
          ? "border-slate-900 ring-2 ring-slate-900/10 shadow-sm"
          : "hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Top Banner / Cover */}
      <div className="relative h-24 bg-slate-100 p-4 flex items-start justify-between border-b border-slate-200 overflow-hidden">
        {/* Date Stamp Badge (Hi.Events signature style) */}
        <div className="relative z-10 w-11 h-13 bg-white border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center shadow-xs">
          <span className="text-[9px] font-bold uppercase text-indigo-600 font-mono tracking-wider">
            {month}
          </span>
          <span className="text-base font-extrabold text-slate-900 leading-none font-display">
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
              className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs transition-colors cursor-pointer"
              title="Edit Acara"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-base leading-snug truncate font-display">
              {event.title}
            </h3>
          </div>
          <span className="text-xs text-indigo-600 font-mono block mt-0.5">
            /e/{event.slug}
          </span>

          {/* Metadata */}
          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {event.date || "-"} {event.time ? `• ${event.time}` : ""}
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

        {/* Bottom Actions Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{event.participant_count || 0} Tamu</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="btn-secondary text-[11px] py-1 px-2.5"
              title="Salin link tamu"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>Salin Link</span>
                </>
              )}
            </button>

            <a
              href={guestUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Buka form pendaftaran"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
