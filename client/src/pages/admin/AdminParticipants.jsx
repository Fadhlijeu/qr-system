import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { Search, Download, CheckCircle, Clock, MessageSquare, RefreshCw, UserCheck, UserX } from "lucide-react";

export function AdminParticipants({ eventId }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    loadParticipants();
  }, [eventId, statusFilter]);

  const loadParticipants = async () => {
    setLoading(true);
    try {
      const res = await api.getParticipants(eventId, { search, status: statusFilter });
      setParticipants(res.participants || []);
    } catch (err) {
      console.error("Failed to load participants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadParticipants();
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      const res = await api.toggleCheckIn(id);
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? res.participant : p))
      );
    } catch (err) {
      alert("Gagal mengubah status: " + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleExport = () => {
    const url = api.getExportUrl(eventId);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Export */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, WhatsApp, email, tiket..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 text-sm py-2"
            />
          </div>
          <button type="submit" className="btn-secondary text-sm px-3">
            Cari
          </button>
        </form>

        {/* Filter Pills & Export */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "all"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua ({participants.length})
            </button>
            <button
              onClick={() => setStatusFilter("checked_in")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "checked_in"
                  ? "bg-emerald-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sudah Hadir
            </button>
            <button
              onClick={() => setStatusFilter("not_checked_in")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "not_checked_in"
                  ? "bg-amber-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Belum Hadir
            </button>
          </div>

          <button
            onClick={handleExport}
            className="btn-secondary text-xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Participants Table */}
      <div className="glass-card overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nomor Tiket</th>
                <th>Nama Peserta</th>
                <th>Kontak & WhatsApp</th>
                <th>Instansi</th>
                <th>Status Kehadiran</th>
                <th>Waktu Check-in</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    Memuat data peserta...
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    Belum ada peserta yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                participants.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="text-slate-500 font-mono text-xs">{idx + 1}</td>
                    <td>
                      <span className="font-mono text-xs font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                        {p.ticket_code}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold text-white block">{p.name}</span>
                      <span className="text-xs text-slate-400">{p.email}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs">{p.whatsapp}</span>
                        {p.whatsapp && (
                          <a
                            href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 transition-colors p-1"
                            title="Chat WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-slate-300 text-xs">{p.organization}</span>
                    </td>
                    <td>
                      {p.checked_in ? (
                        <span className="badge badge-success">
                          <CheckCircle className="w-3 h-3" /> Hadir
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <Clock className="w-3 h-3" /> Belum
                        </span>
                      )}
                    </td>
                    <td className="text-xs text-slate-400 font-mono">
                      {p.checked_in_at ? p.checked_in_at.substring(11, 16) : "-"}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleToggle(p.id)}
                        disabled={togglingId === p.id}
                        className={`text-xs px-2.5 py-1 rounded transition-colors ${
                          p.checked_in
                            ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20"
                        }`}
                        title={p.checked_in ? "Batalkan Check-in" : "Tandai Hadir Manual"}
                      >
                        {p.checked_in ? (
                          <span className="flex items-center gap-1">
                            <UserX className="w-3 h-3" /> Batal
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> Hadir
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
