import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Calendar, Clock, MapPin, Building2, User, Ticket, Download, Printer, CheckCircle } from "lucide-react";

export function TicketCard({ ticket, event, onDownload }) {
  const ticketRef = useRef(null);

  // Encode the direct link to the ticket in the QR code
  const ticketUrl = `${window.location.origin}/t/${ticket.ticket_code}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("ticket-qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${ticket.ticket_code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Ticket Container */}
      <div
        ref={ticketRef}
        className="glass-card relative overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 rounded-2xl"
      >
        {/* Top Header Badge */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white text-center relative">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Ticket className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-widest opacity-90">Official E-Ticket</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">{event.title}</h2>
        </div>

        {/* Event Quick Details */}
        <div className="p-5 border-b border-dashed border-white/10 space-y-2 text-sm text-slate-300">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-medium text-white">{event.date}</span>
            {event.time && <span className="text-slate-400">({event.time})</span>}
          </div>
          {event.location && (
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span className="text-slate-300">{event.location}</span>
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <div className="p-6 text-center bg-slate-950/40 flex flex-col items-center justify-center">
          <div className="p-3 bg-white rounded-xl shadow-xl border-2 border-indigo-500/30 inline-block mb-3">
            <QRCodeSVG
              id="ticket-qr-svg"
              value={ticket.ticket_code}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>
          <div className="font-mono text-sm tracking-widest font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {ticket.ticket_code}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Tunjukkan kode QR ini kepada petugas di meja registrasi
          </p>
        </div>

        {/* Perforated Stub Line with Circles */}
        <div className="relative border-t border-dashed border-white/15 my-1">
          <div className="absolute -left-3.5 -top-3.5 w-7 h-7 bg-[#090d16] rounded-full border-r border-white/10"></div>
          <div className="absolute -right-3.5 -top-3.5 w-7 h-7 bg-[#090d16] rounded-full border-l border-white/10"></div>
        </div>

        {/* Participant Details Stub */}
        <div className="p-5 space-y-2.5 text-sm bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Nama Peserta
            </span>
            <span className="font-semibold text-white">{ticket.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Instansi / Organisasi
            </span>
            <span className="font-medium text-slate-200">{ticket.organization}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs text-slate-400">
            <span>Status:</span>
            {ticket.checked_in ? (
              <span className="badge badge-success text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Sudah Hadir ({ticket.checked_in_at?.substring(11, 16)})
              </span>
            ) : (
              <span className="badge badge-warning text-[11px] font-semibold">
                Siap Digunakan
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons (Excluded from print) */}
      <div className="no-print mt-4 flex items-center justify-center gap-3">
        <button
          onClick={handlePrint}
          className="btn-secondary flex-1 text-sm py-2.5"
        >
          <Printer className="w-4 h-4" /> Cetak / PDF
        </button>
        <button
          onClick={handleDownloadQR}
          className="btn-primary flex-1 text-sm py-2.5"
        >
          <Download className="w-4 h-4" /> Simpan QR
        </button>
      </div>
    </div>
  );
}
