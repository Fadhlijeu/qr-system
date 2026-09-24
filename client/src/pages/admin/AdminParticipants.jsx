import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { QRCodeSVG } from "qrcode.react";
import {
  Search,
  Download,
  CheckCircle,
  Clock,
  MessageSquare,
  Copy,
  Check,
  UserCheck,
  UserX,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Mail
} from "lucide-react";

export function AdminParticipants({ eventId }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | name
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected participant for detail modal
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);

  useEffect(() => {
    loadParticipants();
    setCurrentPage(1);
  }, [eventId, statusFilter]);

  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

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
    setCurrentPage(1);
  };

  const handleToggle = async (id, e) => {
    if (e) e.stopPropagation();
    setTogglingId(id);
    try {
      const res = await api.toggleCheckIn(id);
      const updated = res.participant;
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
      if (selectedParticipant?.id === id) {
        setSelectedParticipant(updated);
      }
      showToast(updated.checked_in ? "Peserta ditandai Hadir" : "Check-in dibatalkan");
    } catch (err) {
      showToast("Gagal mengubah status: " + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleExport = () => {
    const url = api.getExportUrl(eventId);
    window.open(url, "_blank");
    showToast("Mengunduh data CSV peserta...");
  };

  const handleCopyText = (text, field, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast(`${field} tersalin!`);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Sort participants client-side
  const sortedParticipants = [...participants].sort((a, b) => {
    if (sortBy === "name") {
      return (a.name || "").localeCompare(b.name || "");
    } else if (sortBy === "oldest") {
      return a.id - b.id;
    } else {
      return b.id - a.id;
    }
  });

  // Pagination slice
  const totalItems = sortedParticipants.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedList = sortedParticipants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/40 text-slate-100 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, tiket, kontak, instansi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 text-xs py-2"
            />
          </div>
          <button type="submit" className="btn-secondary text-xs px-3">
            Cari
          </button>
        </form>

        {/* Filters, Sorters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Pills */}
          <div className="flex bg-[#0f1627] p-1 rounded-lg border border-white/5 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === "all"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua ({participants.length})
            </button>
            <button
              onClick={() => setStatusFilter("checked_in")}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === "checked_in"
                  ? "bg-emerald-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Hadir
            </button>
            <button
              onClick={() => setStatusFilter("not_checked_in")}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === "not_checked_in"
                  ? "bg-amber-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Belum
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0f1627] px-2.5 py-1 rounded-lg border border-white/5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900">Terbaru</option>
              <option value="oldest" className="bg-slate-900">Terlama</option>
              <option value="name" className="bg-slate-900">Nama (A-Z)</option>
            </select>
          </div>

          {/* CSV Export */}
          <button
            onClick={handleExport}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            title="Export CSV Peserta"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-pro overflow-hidden">
        <div className="overflow-x-auto">
          <table className="attendee-table">
            <thead>
              <tr>
                <th className="w-10 text-center">#</th>
                <th>Peserta</th>
                <th>Nomor Tiket</th>
                <th>Instansi</th>
                <th>Kontak</th>
                <th>Status</th>
                <th>Waktu Check-in</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan="8" className="py-4 px-6">
                      <div className="h-6 skeleton w-full" />
                    </td>
                  </tr>
                ))
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-14 text-slate-400 text-xs space-y-2">
                    <p className="font-semibold text-slate-300 text-sm">
                      {search ? "Tidak ditemukan peserta yang sesuai." : "Belum ada peserta yang mendaftar pada acara ini."}
                    </p>
                    <p className="text-slate-500">
                      Bagikan link formulir registrasi kepada calon tamu untuk mulai menerima pendaftaran.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((p, idx) => {
                  const itemIndex = (currentPage - 1) * pageSize + idx + 1;
                  const initials = p.name
                    ? p.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "P";

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedParticipant(p)}
                      className="cursor-pointer group"
                    >
                      <td className="text-center text-slate-500 font-mono text-xs">
                        {itemIndex}
                      </td>

                      {/* Participant & Avatar */}
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 group-hover:border-indigo-500/40 transition-colors">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-white text-xs block group-hover:text-indigo-300 transition-colors truncate">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {p.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Ticket Code */}
                      <td>
                        <button
                          onClick={(e) => handleCopyText(p.ticket_code, "Tiket", e)}
                          className="font-mono text-xs font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/25 flex items-center gap-1 transition-colors"
                          title="Klik untuk menyalin nomor tiket"
                        >
                          <span>{p.ticket_code}</span>
                          <Copy className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      </td>

                      {/* Organization */}
                      <td className="text-slate-300 text-xs truncate max-w-[160px]">
                        {p.organization || "-"}
                      </td>

                      {/* Contact / WhatsApp */}
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-300">
                            {p.whatsapp}
                          </span>
                          {p.whatsapp && (
                            <a
                              href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-emerald-500/10 transition-colors"
                              title="Chat via WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        {p.checked_in ? (
                          <span className="badge badge-success text-[10px]">
                            <CheckCircle className="w-3 h-3" /> Hadir
                          </span>
                        ) : (
                          <span className="badge badge-warning text-[10px]">
                            <Clock className="w-3 h-3" /> Belum
                          </span>
                        )}
                      </td>

                      {/* Check-in time */}
                      <td className="text-slate-400 text-xs font-mono">
                        {p.checked_in_at ? p.checked_in_at.substring(11, 16) : "-"}
                      </td>

                      {/* Toggle Action */}
                      <td className="text-center">
                        <button
                          onClick={(e) => handleToggle(p.id, e)}
                          disabled={togglingId === p.id}
                          className={p.checked_in ? "btn-outline-danger" : "btn-outline-success"}
                          title={p.checked_in ? "Batalkan Check-in" : "Tandai Hadir Manual"}
                        >
                          {p.checked_in ? (
                            <>
                              <UserX className="w-3 h-3" />
                              <span>Batal</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3" />
                              <span>Hadir</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 bg-[#0e1424]">
            <span>
              Menampilkan {Math.min((currentPage - 1) * pageSize + 1, totalItems)} -{" "}
              {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} peserta
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-medium text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Participant Detail Drawer / Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-pro max-w-md w-full p-6 space-y-5 border border-white/20 bg-[#131b2e] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Detail Peserta</h3>
                <span className="text-xs text-slate-400">Informasi registrasi & status kehadiran</span>
              </div>
              <button
                onClick={() => setSelectedParticipant(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Attendee QR Preview & Code */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5 text-center flex flex-col items-center">
              <div className="p-2.5 bg-white rounded-lg shadow-md mb-2">
                <QRCodeSVG
                  value={selectedParticipant.ticket_code}
                  size={120}
                  level="H"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-indigo-400">
                  {selectedParticipant.ticket_code}
                </span>
                <button
                  onClick={(e) => handleCopyText(selectedParticipant.ticket_code, "Nomor Tiket", e)}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Salin Nomor Tiket"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Information Grid */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Nama Lengkap</span>
                <strong className="text-white text-right">{selectedParticipant.name}</strong>
              </div>

              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Instansi / Organisasi</span>
                <span className="text-slate-200 text-right">{selectedParticipant.organization || "-"}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Nomor WhatsApp</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-200">{selectedParticipant.whatsapp}</span>
                  {selectedParticipant.whatsapp && (
                    <a
                      href={`https://wa.me/${selectedParticipant.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Alamat Email</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-200">{selectedParticipant.email}</span>
                  <button
                    onClick={(e) => handleCopyText(selectedParticipant.email, "Email", e)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Status Kehadiran</span>
                {selectedParticipant.checked_in ? (
                  <span className="badge badge-success text-[10px]">
                    <CheckCircle className="w-3 h-3" /> Sudah Hadir ({selectedParticipant.checked_in_at?.substring(11, 16)})
                  </span>
                ) : (
                  <span className="badge badge-warning text-[10px]">
                    <Clock className="w-3 h-3" /> Belum Hadir
                  </span>
                )}
              </div>
            </div>

            {/* Actions in Modal */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`/t/${selectedParticipant.ticket_code}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs flex-1 py-2 flex items-center justify-center gap-1.5"
              >
                <span>Buka Tiket Tamu</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => handleToggle(selectedParticipant.id)}
                disabled={togglingId === selectedParticipant.id}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  selectedParticipant.checked_in
                    ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25"
                    : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                }`}
              >
                {selectedParticipant.checked_in ? (
                  <>
                    <UserX className="w-3.5 h-3.5" />
                    <span>Batalkan Check-in</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Tandai Hadir Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
