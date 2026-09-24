import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { TicketCard } from "../../components/TicketCard";

export function TicketView({ ticketCode }) {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ticketCode) {
      loadTicket();
    }
  }, [ticketCode]);

  const loadTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getTicket(ticketCode);
      setTicketData(res);
    } catch (err) {
      setError(err.message || "Tiket tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-body)", padding: "20px" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner lg" style={{ margin: "0 auto 16px" }}></div>
          <p style={{ color: "var(--t-muted)", fontSize: "13px" }}>Memuat E-Ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-body)", padding: "20px" }}>
        <div className="card" style={{ maxWidth: "440px", width: "100%", textAlign: "center", padding: "40px 24px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--danger-soft)", color: "var(--danger)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px", color: "var(--t-base)" }}>
            Tiket Tidak Ditemukan
          </h2>
          <p style={{ color: "var(--t-muted)", fontSize: "13px", margin: "0 0 20px" }}>
            {error || "Kode tiket tidak valid atau sudah kadaluarsa."}
          </p>
          <button onClick={() => window.history.back()} className="btn btn--ghost" style={{ width: "100%", justifyContent: "center" }}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-body)", padding: "40px 16px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto 24px", textAlign: "center" }}>
        <span className="eyebrow" style={{ display: "block", marginBottom: "6px" }}>
          E-Ticket Tamu Resmi
        </span>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--t-base)", margin: 0, letterSpacing: "-0.02em" }}>
          {ticketData.event?.title || "Acara"}
        </h1>
      </div>

      <TicketCard ticket={ticketData.ticket} event={ticketData.event} />
    </div>
  );
}
