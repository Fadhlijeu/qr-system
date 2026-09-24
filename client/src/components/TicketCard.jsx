import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  User,
  Ticket,
  Download,
  Printer,
  Copy,
  Check,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export function TicketCard({ ticket, event }) {
  const [copied, setCopied] = useState(false);

  const ticketUrl = `${window.location.origin}/t/${ticket.ticket_code}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(ticketUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("ticket-qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 48;
      canvas.height = img.height + 48;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 24, 24);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `Tiket_${ticket.ticket_code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Boarding Pass Ticket */}
      <div className="ticket-boarding-pass border border-white/10 bg-[#111827] shadow-2xl">
        {/* 1. Event Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Official E-Ticket
            </span>
            <Ticket className="w-4 h-4 text-indigo-400 opacity-80" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
            {event?.title || "Acara Resmi"}
          </h2>
        </div>

        {/* 2. Attendee & Event Metadata */}
        <div className="p-5 space-y-4 bg-[#111827]">
          {/* Attendee */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Nama Peserta
            </span>
            <div className="text-base font-extrabold text-white">
              {ticket.name}
            </div>
            {ticket.organization && (
              <div className="text-xs text-indigo-300 font-medium mt-0.5">
                {ticket.organization}
              </div>
            )}
          </div>

          {/* Date, Time, Location Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 text-xs text-slate-300">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Tanggal & Waktu
              </span>
              <span className="font-semibold text-white block mt-0.5">
                {event?.date || "-"}
              </span>
              {event?.time && (
                <span className="text-slate-400 text-[11px] block">
                  {event.time}
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Lokasi Acara
              </span>
              <span className="font-semibold text-white block mt-0.5 truncate">
                {event?.location || "Diumumkan panitia"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Perforated Notch Divider */}
        <div className="ticket-notch-divider" />

        {/* 4. Large QR Code Section */}
        <div className="p-6 text-center bg-slate-950/60 flex flex-col items-center justify-center">
          <div className="p-3.5 bg-white rounded-2xl shadow-xl inline-block mb-3 border-4 border-slate-900">
            <QRCodeSVG
              id="ticket-qr-svg"
              value={ticket.ticket_code}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="font-mono text-base tracking-widest font-black text-indigo-300 bg-indigo-500/10 px-4 py-1 rounded-full border border-indigo-500/25">
            {ticket.ticket_code}
          </div>

          <div className="mt-3">
            {ticket.checked_in ? (
              <span className="badge badge-success text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Sudah Hadir ({ticket.checked_in_at?.substring(11, 16)})
              </span>
            ) : (
              <span className="badge badge-warning text-xs font-semibold">
                ● Siap Digunakan
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400 max-w-xs mt-3 leading-relaxed">
            Pastikan tiket ini disimpan dan ditunjukkan kepada panitia di pintu masuk acara.
          </p>
        </div>
      </div>

      {/* 5. Action Buttons (Excluded from print) */}
      <div className="no-print flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={handleDownloadQR}
          className="btn-primary flex-1 text-xs py-2.5"
          title="Simpan gambar QR Code ke galeri / perangkat"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Simpan QR</span>
        </button>

        <button
          onClick={handlePrint}
          className="btn-secondary flex-1 text-xs py-2.5"
          title="Cetak tiket atau simpan sebagai dokumen PDF"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak / PDF</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="btn-secondary text-xs py-2.5 px-3"
          title="Salin tautan tiket langsung"
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
      </div>
    </div>
  );
}
