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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-sm text-slate-400">Memuat E-Ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold">E-Ticket Tidak Ditemukan</h2>
          <p className="text-sm text-slate-400">{error || "Kode tiket tidak valid."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col justify-center">
      <div className="bg-mesh" />
      <div className="container-narrow space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
            Official E-Ticket
          </span>
          <h1 className="text-2xl font-bold text-white">Tiket Masuk Acara</h1>
        </div>

        <TicketCard ticket={ticketData.ticket} event={ticketData.event} />
      </div>
    </div>
  );
}
