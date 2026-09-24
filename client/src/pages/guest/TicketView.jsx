import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { TicketCard } from "../../components/TicketCard";
import { Loader2, AlertCircle } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0f19]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-xs text-slate-400">Memuat E-Ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0f19]">
        <div className="card-pro max-w-md w-full p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">E-Ticket Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400">{error || "Kode tiket tidak valid atau sudah dihapus."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col justify-center bg-[#0b0f19]">
      <div className="bg-ambient-clean" />
      <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
        <TicketCard ticket={ticketData.ticket} event={ticketData.event} />
      </div>
    </div>
  );
}
