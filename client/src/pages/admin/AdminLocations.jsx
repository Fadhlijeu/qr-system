import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { LocationMapPicker } from "../../components/LocationMapPicker";

export function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    address: "",
    capacity: 0,
    lat: null,
    lng: null,
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const res = await api.getSavedLocations();
      setLocations(res.locations || []);
    } catch (err) {
      console.error("Gagal memuat lokasi tersimpan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingLoc(null);
    setForm({
      name: "",
      address: "",
      capacity: 0,
      lat: null,
      lng: null,
    });
    setErrorMsg(null);
    setShowMap(false);
    setShowModal(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    setForm({
      name: loc.name || "",
      address: loc.address || "",
      capacity: loc.capacity || 0,
      lat: loc.lat || null,
      lng: loc.lng || null,
    });
    setErrorMsg(null);
    setShowMap(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg("Nama lokasi/venue wajib diisi.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      if (editingLoc) {
        await api.updateSavedLocation(editingLoc.id, form);
      } else {
        await api.createSavedLocation(form);
      }
      setShowModal(false);
      loadLocations();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan lokasi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus lokasi "${name}" dari daftar lokasi tersimpan?`)) return;
    try {
      await api.deleteSavedLocation(id);
      loadLocations();
    } catch (err) {
      alert("Gagal menghapus lokasi: " + (err.message || "Server error"));
    }
  };

  return (
    <div>
      {/* Hero Header */}
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Venue & Tempat</span>
          <h1 className="hero-title">Lokasi Tersimpan</h1>
        </div>
        {locations.length > 0 && (
          <div className="hero-actions">
            <button onClick={handleOpenCreate} className="btn btn--primary">
              <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
              <span>Tambah Lokasi</span>
            </button>
          </div>
        )}
      </section>

      {/* Content */}
      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <div className="spinner lg" style={{ margin: "0 auto 16px" }}></div>
          <p style={{ color: "var(--t-muted)", fontSize: "13px" }}>Memuat daftar lokasi...</p>
        </div>
      ) : locations.length === 0 ? (
        /* Empty State matching Hi.Events Screenshot 1 */
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "56px 32px",
            maxWidth: "520px",
            margin: "40px auto",
            border: "1px solid var(--border-soft)",
            borderRadius: "16px",
          }}
        >
          {/* Calendar & Clock Cloud Illustration */}
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 20px",
              display: "grid",
              placeItems: "center",
              background: "var(--primary-soft, #f0fdf4)",
              borderRadius: "20px",
              color: "var(--primary, #16a34a)",
            }}
          >
            <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="12" y="16" width="40" height="38" rx="6" />
              <path d="M12 28h40M22 10v10M42 10v10" />
              <circle cx="44" cy="20" r="12" fill="var(--bg-card, #ffffff)" stroke="currentColor" strokeWidth="2.5" />
              <path d="M44 14v6l4 2" />
            </svg>
          </div>

          <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 10px", color: "var(--t-base)" }}>
            No Saved Locations
          </h3>

          <p style={{ color: "var(--t-muted)", fontSize: "13.5px", lineHeight: 1.6, margin: "0 auto 28px", maxWidth: "42ch" }}>
            Reusable venues appear here automatically as you create events with addresses, and you can add your own.
          </p>

          <button
            onClick={handleOpenCreate}
            className="btn btn--primary"
            style={{ margin: "0 auto", padding: "10px 20px", fontSize: "13.5px" }}
          >
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            <span>Add Location</span>
          </button>
        </div>
      ) : (
        /* Locations Grid */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {locations.map((loc) => {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address || loc.name)}`;
            return (
              <div
                key={loc.id}
                className="card"
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "14px",
                  transition: "transform .15s, box-shadow .15s",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: "var(--primary-soft)",
                          color: "var(--primary)",
                          display: "grid",
                          placeItems: "center",
                          shrink: 0,
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                      </div>
                      <div>
                        <h4 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--t-base)" }}>
                          {loc.name}
                        </h4>
                        {loc.capacity > 0 && (
                          <span style={{ fontSize: "11px", color: "var(--t-muted)" }}>
                            Kapasitas: {loc.capacity.toLocaleString()} orang
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => handleOpenEdit(loc)}
                        className="btn btn--sm btn--ghost"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                        title="Edit Lokasi"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(loc.id, loc.name)}
                        className="btn btn--sm btn--ghost"
                        style={{ padding: "4px 8px", fontSize: "11px", color: "var(--danger)" }}
                        title="Hapus Lokasi"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  <p
                    style={{
                      margin: "12px 0 0",
                      fontSize: "12.5px",
                      color: "var(--t-muted)",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {loc.address || "Tidak ada alamat detail."}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="mono" style={{ fontSize: "11px", color: "var(--t-light)" }}>
                    {loc.lat && loc.lng ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : "Tanpa pin koordinat"}
                  </span>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "11.5px", color: "var(--primary)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px" }}
                  >
                    <span>Google Maps</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Lokasi (With Outside-Click Protection!) */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: "16px",
            overflowY: "auto",
          }}
        >
          <div
            className="modal-demo"
            style={{ width: "100%", maxWidth: "560px", margin: "auto" }}
          >
            <div className="modal-head">
              <div className="modal-title">
                {editingLoc ? "Edit Lokasi / Venue" : "Tambah Lokasi Baru"}
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ color: "var(--t-light)", cursor: "pointer", fontSize: "16px" }}
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="alert danger" style={{ margin: "16px 20px 0" }}>
                <div className="body">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="field">
                  <label className="field-label">
                    Nama Tempat / Venue <span className="req">*</span>
                  </label>
                  <input
                    className="input"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Grand Ballroom Hotel Mulia, Ruang Serbaguna Lt. 2..."
                  />
                </div>

                <div className="field">
                  <label className="field-label">Alamat Lengkap</label>
                  <input
                    className="input"
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Jalan, nomor, kelurahan, kota..."
                  />

                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setShowMap((v) => !v)}
                      className="btn btn--ghost btn--sm"
                      style={{ fontSize: "11.5px", padding: "5px 12px" }}
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                      <span>{showMap ? "Tutup Peta" : "Pilih Titik Pin di Peta"}</span>
                    </button>
                  </div>

                  {showMap && (
                    <LocationMapPicker
                      initialValue={form.address || form.name}
                      onSelectLocation={(address, coords) => {
                        setForm((prev) => ({
                          ...prev,
                          address,
                          lat: coords?.lat ?? prev.lat,
                          lng: coords?.lng ?? prev.lng,
                        }));
                      }}
                      onClose={() => setShowMap(false)}
                    />
                  )}
                </div>

                <div className="field">
                  <label className="field-label">Kapasitas Maksimal Tamu (Opsional)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.capacity}
                    onChange={(e) => setForm((prev) => ({ ...prev, capacity: Number(e.target.value) || 0 }))}
                    placeholder="0 = tidak dibatasi"
                  />
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn--ghost">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="btn btn--primary">
                  {saving ? "Menyimpan..." : editingLoc ? "Simpan Perubahan" : "Tambah Lokasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
