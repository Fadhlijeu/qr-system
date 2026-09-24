import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { QRCodeSVG } from "qrcode.react";

export function AdminParticipants({ eventId }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    loadParticipants();
    setCurrentPage(1);
  }, [eventId, statusFilter]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const loadParticipants = async () => {
    setLoading(true);
    try {
      if (eventId) {
        const res = await api.getParticipants(eventId, { search, status: statusFilter });
        setParticipants(res.participants || []);
      } else {
        setParticipants([]);
      }
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
    if (!eventId) return;
    const url = api.getExportUrl(eventId);
    window.open(url, "_blank");
    showToast("Mengunduh data CSV peserta...");
  };

  // Sort participants client-side
  const sortedParticipants = [...participants].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "oldest") {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const totalPages = Math.max(1, Math.ceil(sortedParticipants.length / pageSize));
  const paginatedList = sortedParticipants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      {/* Toast alert */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 100,
            background: "var(--t-base)",
            color: "var(--t-inverse)",
            padding: "10px 18px",
            borderRadius: "8px",
            fontSize: "13px",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--success)" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Manajemen · Kehadiran</span>
          <h1 className="hero-title">Daftar Peserta</h1>
          <p className="hero-sub">
            Total <strong>{participants.length}</strong> peserta terdaftar
          </p>
        </div>
        <div className="hero-actions">
          <button onClick={handleExport} className="btn btn--ghost" disabled={!eventId || participants.length === 0}>
            <svg viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* DataTable Section */}
      <div className="grid">
        <section className="col-12 card">
          {/* Data Toolbar */}
          <div className="data-toolbar">
            <div className="data-toolbar-left">
              <form onSubmit={handleSearchSubmit} className="input-icon" style={{ flex: 1, maxWidth: "340px" }}>
                <span className="ico">
                  <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </span>
                <input
                  className="input"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama, WA, email, tiket..."
                />
              </form>
            </div>

            <div className="data-toolbar-right">
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: "auto", fontSize: "12px" }}
              >
                <option value="all">Semua Status</option>
                <option value="checked_in">Sudah Hadir</option>
                <option value="not_checked_in">Belum Hadir</option>
              </select>

              <select
                className="select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: "auto", fontSize: "12px" }}
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="name">Nama A-Z</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="table-scroll" style={{ width: "100%", overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", minWidth: "880px" }}>
              <thead>
                <tr>
                  <th style={{ minWidth: "200px" }}>Peserta</th>
                  <th style={{ minWidth: "140px" }}>Nomor WhatsApp</th>
                  <th style={{ minWidth: "160px" }}>Instansi / Perusahaan</th>
                  <th style={{ minWidth: "110px" }}>Status</th>
                  <th style={{ minWidth: "120px" }}>ID Tiket</th>
                  <th style={{ minWidth: "130px" }}>Waktu Daftar</th>
                  <th style={{ textAlign: "right", minWidth: "190px" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px 0", color: "var(--t-light)" }}>
                      Memuat data peserta...
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "48px 0" }}>
                      <div style={{ maxWidth: "340px", margin: "0 auto", color: "var(--t-muted)" }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--t-base)", marginBottom: "4px" }}>
                          Belum Ada Data Peserta
                        </div>
                        <p style={{ fontSize: "12px", margin: 0, lineHeight: 1.5 }}>
                          {search || statusFilter !== "all"
                            ? "Tidak ada peserta yang cocok dengan filter pencarian."
                            : "Peserta yang mendaftar akan otomatis tercatat di sini."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((p) => {
                    const isChecked = Boolean(p.checked_in);
                    const isToggling = togglingId === p.id;
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
                        className={`data-row ${isChecked ? "is-selected" : ""}`}
                        onClick={() => setSelectedParticipant(p)}
                        style={{ cursor: "pointer" }}
                      >
                        {/* Attendee Name & Email */}
                        <td>
                          <div className="data-cell-user">
                            <div className="av" style={{ background: "linear-gradient(135deg, var(--primary), var(--purple))" }}>
                              {initials}
                            </div>
                            <div className="data-cell-user-meta">
                              <div className="data-cell-user-name" style={{ fontWeight: 600 }}>
                                {p.name}
                              </div>
                              <div className="data-cell-user-email">
                                {p.email || "-"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* WhatsApp */}
                        <td style={{ color: "var(--t-base)", whiteSpace: "nowrap" }}>
                          {p.whatsapp || "-"}
                        </td>

                        {/* Organization */}
                        <td style={{ color: "var(--t-muted)" }}>
                          {p.organization || "-"}
                        </td>

                        {/* Status Badge */}
                        <td style={{ whiteSpace: "nowrap" }}>
                          {isChecked ? (
                            <span className="badge success dot">Hadir</span>
                          ) : (
                            <span className="badge dot" style={{ color: "var(--t-light)" }}>
                              Terdaftar
                            </span>
                          )}
                        </td>

                        {/* Ticket Code */}
                        <td style={{ whiteSpace: "nowrap" }}>
                          <span
                            className="data-cell-mono"
                            style={{
                              fontSize: "12px",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              background: "var(--bg-muted)",
                              border: "1px solid var(--border-soft)",
                              fontWeight: 600
                            }}
                          >
                            {p.ticket_code}
                          </span>
                        </td>

                        {/* Date Registered */}
                        <td style={{ whiteSpace: "nowrap" }}>
                          <span className="data-cell-mono" style={{ fontSize: "11.5px" }}>
                            {p.created_at
                              ? new Date(p.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : "-"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: "right", whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "inline-flex", gap: "8px", alignItems: "center", justifyContent: "flex-end" }}>
                            <button
                              onClick={(e) => handleToggle(p.id, e)}
                              disabled={isToggling}
                              className={`btn btn--sm ${isChecked ? "btn--soft-warning" : "btn--primary"}`}
                              style={{ fontSize: "11px", padding: "5px 12px", whiteSpace: "nowrap" }}
                            >
                              {isToggling ? "..." : isChecked ? "Batal Hadir" : "Tandai Hadir"}
                            </button>

                            <a
                              href={`/t/${p.ticket_code}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn--sm btn--ghost"
                              style={{ fontSize: "11px", padding: "5px 10px", whiteSpace: "nowrap" }}
                            >
                              Buka Tiket
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Data Footer / Pagination */}
          {!loading && paginatedList.length > 0 && (
            <div className="data-foot">
              <div className="data-foot-info">
                <span>
                  Menampilkan <strong>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, participants.length)}</strong> dari <strong>{participants.length}</strong> peserta
                </span>
              </div>
              <div className="pager">
                <button
                  className="pager-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous"
                >
                  <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <button className="pager-btn is-active">{currentPage}</button>
                <button
                  className="pager-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next"
                >
                  <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Participant Detail Modal */}
      {selectedParticipant && (
        <div
          onClick={() => setSelectedParticipant(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: "16px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-demo"
            style={{ width: "100%", maxWidth: "520px" }}
          >
            <div className="modal-head">
              <div className="modal-title">Detail Peserta & Tiket</div>
              <button
                onClick={() => setSelectedParticipant(null)}
                style={{ color: "var(--t-light)", padding: "4px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px", background: "var(--bg-muted)", borderRadius: "10px" }}>
                <div style={{ padding: "8px", background: "#fff", borderRadius: "8px", border: "1px solid var(--border)", shrink: 0 }}>
                  <QRCodeSVG value={selectedParticipant.ticket_code} size={90} level="H" />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--t-base)" }}>
                    {selectedParticipant.name}
                  </div>
                  <div style={{ fontSize: "11px", fontFamily: "JetBrains Mono, monospace", color: "var(--primary)", fontWeight: 600, marginTop: "2px" }}>
                    {selectedParticipant.ticket_code}
                  </div>
                  <div style={{ marginTop: "6px" }}>
                    {selectedParticipant.checked_in ? (
                      <span className="badge success dot">Sudah Hadir (Checked In)</span>
                    ) : (
                      <span className="badge dot" style={{ color: "var(--t-light)" }}>Belum Hadir</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--t-light)", display: "block" }}>WhatsApp</span>
                  <strong style={{ color: "var(--t-base)" }}>{selectedParticipant.whatsapp || "-"}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--t-light)", display: "block" }}>Email</span>
                  <strong style={{ color: "var(--t-base)", wordBreak: "break-all" }}>{selectedParticipant.email || "-"}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--t-light)", display: "block" }}>Instansi / Perusahaan</span>
                  <strong style={{ color: "var(--t-base)" }}>{selectedParticipant.organization || "-"}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--t-light)", display: "block" }}>Waktu Terdaftar</span>
                  <strong style={{ color: "var(--t-base)" }}>
                    {selectedParticipant.created_at ? new Date(selectedParticipant.created_at).toLocaleString("id-ID") : "-"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="modal-foot">
              <a
                href={`/t/${selectedParticipant.ticket_code}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn--ghost"
                style={{ fontSize: "12px" }}
              >
                Buka Halaman Tiket
              </a>
              <button
                onClick={(e) => handleToggle(selectedParticipant.id, e)}
                disabled={togglingId === selectedParticipant.id}
                className={`btn ${selectedParticipant.checked_in ? "btn--warning" : "btn--primary"}`}
                style={{ fontSize: "12px" }}
              >
                {selectedParticipant.checked_in ? "Batalkan Hadir" : "Tandai Hadir Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
