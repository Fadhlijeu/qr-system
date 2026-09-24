import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

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

  const isCheckedIn = Boolean(ticket.checked_in);

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Ticket Boarding Pass Card */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-card)",
          background: "var(--bg-card)"
        }}
      >
        {/* Top 4px Solid Accent Line */}
        <div style={{ height: "4px", background: "linear-gradient(90deg, var(--primary), var(--purple))", width: "100%" }} />

        {/* 1. Header */}
        <div
          style={{
            padding: "24px 32px 18px",
            borderBottom: "1px solid var(--border-soft)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap"
          }}
        >
          <div>
            <span className="eyebrow" style={{ color: "var(--primary)", display: "block", marginBottom: "4px" }}>
              Official Event Admission Pass
            </span>
            <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "var(--t-base)", letterSpacing: "-0.02em" }}>
              {event?.title || "Grand Opening Event"}
            </h2>
          </div>

          <div>
            {isCheckedIn ? (
              <span className="badge success dot" style={{ fontSize: "12px", padding: "5px 12px" }}>
                Sudah Hadir (Checked In)
              </span>
            ) : (
              <span className="badge info dot" style={{ fontSize: "12px", padding: "5px 12px" }}>
                Tiket Aktif
              </span>
            )}
          </div>
        </div>

        {/* 2. Main Body Split: Details + QR Stub */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch" }}>
          {/* Details Section */}
          <div style={{ flex: 1, minWidth: "300px", padding: "28px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <span className="eyebrow" style={{ display: "block", marginBottom: "4px" }}>
                Nama Tamu Undangan
              </span>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--t-base)" }}>
                {ticket.name}
              </div>
              {ticket.organization && (
                <div style={{ fontSize: "13px", color: "var(--t-muted)", marginTop: "2px" }}>
                  {ticket.organization}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>
              <div>
                <span className="eyebrow" style={{ display: "block", marginBottom: "4px" }}>
                  Tanggal & Waktu
                </span>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--t-base)" }}>
                  {event?.date || "-"}
                </div>
                {event?.time && (
                  <div style={{ fontSize: "12px", color: "var(--t-muted)" }}>
                    {event.time}
                  </div>
                )}
              </div>

              <div>
                <span className="eyebrow" style={{ display: "block", marginBottom: "4px" }}>
                  Lokasi / Venue
                </span>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--t-base)" }}>
                  {event?.location || "Main Venue"}
                </div>
              </div>

              <div>
                <span className="eyebrow" style={{ display: "block", marginBottom: "4px" }}>
                  Jenis Tiket
                </span>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--t-base)" }}>
                  General Admission (Undangan)
                </div>
              </div>

              <div>
                <span className="eyebrow" style={{ display: "block", marginBottom: "4px" }}>
                  Kontak
                </span>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--t-base)" }}>
                  {ticket.whatsapp || ticket.email || "-"}
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "16px", marginTop: "auto", fontSize: "12px", color: "var(--t-muted)", lineHeight: 1.5 }}>
              Tunjukkan QR Code pada tiket ini kepada panitia di pintu masuk saat kedatangan untuk validasi otomatis.
            </div>
          </div>

          {/* QR Stub Section */}
          <div
            style={{
              width: "250px",
              background: "var(--bg-muted)",
              borderLeft: "1px solid var(--border-soft)",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: "12px"
            }}
          >
            <div
              style={{
                padding: "10px",
                background: "#ffffff",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              <QRCodeSVG
                id="ticket-qr-svg"
                value={ticket.ticket_code}
                size={140}
                level="H"
              />
            </div>

            <div style={{ width: "100%" }}>
              <span className="eyebrow" style={{ display: "block", marginBottom: "4px" }}>
                ID Tiket Resmi
              </span>
              <span
                className="mono"
                style={{
                  fontSize: "10.5px",
                  fontWeight: 600,
                  color: "var(--primary)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  display: "inline-block",
                  wordBreak: "break-all"
                }}
              >
                {ticket.ticket_code}
              </span>
            </div>

            <p style={{ fontSize: "11px", color: "var(--t-light)", margin: 0 }}>
              Scan di pintu masuk acara
            </p>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div
        className="card"
        style={{
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleDownloadQR} className="btn btn--primary">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download PNG</span>
          </button>

          <button onClick={handlePrint} className="btn btn--ghost">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Cetak Tiket</span>
          </button>
        </div>

        <button onClick={handleCopyLink} className="btn btn--ghost" style={{ fontSize: "12px" }}>
          {copied ? "Link Tiket Tersalin!" : "Salin Link Tiket"}
        </button>
      </div>
    </div>
  );
}
