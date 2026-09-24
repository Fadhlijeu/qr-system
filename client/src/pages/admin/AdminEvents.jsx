import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { Plus, Calendar, Clock, MapPin, Users, Edit3, Copy, Check, ExternalLink } from "lucide-react";

export function AdminEvents({ onSelectEvent, selectedEventId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    date: "",
    time: "",
    location: "",
    description: "",
    capacity: 0,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents();
      setEvents(res.events || []);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setForm({
      title: "",
      slug: "",
      date: new Date().toISOString().substring(0, 10),
      time: "09:00 - 17:00 WIB",
      location: "",
      description: "",
      capacity: 0,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (ev) => {
    setEditingEvent(ev);
    setForm({
      title: ev.title,
      slug: ev.slug,
      date: ev.date,
      time: ev.time || "",
      location: ev.location || "",
      description: ev.description || "",
      capacity: ev.capacity || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, form);
      } else {
        await api.createEvent(form);
      }
      setShowModal(false);
      loadEvents();
    } catch (err) {
      alert("Gagal menyimpan acara: " + err.message);
    }
  };

  const handleCopyLink = (ev) => {
    const url = `${window.location.origin}/e/${ev.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(ev.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Daftar Acara</h2>
          <p className="text-xs text-slate-400">Pilih acara untuk melihat dashboard & scanner</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary text-xs flex items-center gap-1.5 py-2">
          <Plus className="w-4 h-4" /> Buat Acara Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((ev) => {
          const isSelected = selectedEventId === ev.id;
          return (
            <div
              key={ev.id}
              className={`glass-card p-5 border transition-all ${
                isSelected
                  ? "border-indigo-500 bg-indigo-950/30"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-white text-base">{ev.title}</h3>
                  <span className="text-xs text-indigo-400 font-mono">/e/{ev.slug}</span>
                </div>
                <button
                  onClick={() => handleOpenEdit(ev)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Edit Acara"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ev.date} {ev.time && `(${ev.time})`}</span>
                </div>
                {ev.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Terdaftar: <strong>{ev.total_registered}</strong>
                    {ev.capacity > 0 ? ` / ${ev.capacity}` : " (Tanpa Kuota)"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => onSelectEvent(ev.id)}
                  className={`flex-1 text-xs py-2 rounded-lg font-semibold transition-colors ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {isSelected ? "Acara Aktif" : "Pilih Acara Ini"}
                </button>

                <button
                  onClick={() => handleCopyLink(ev)}
                  className="btn-secondary text-xs py-2 px-3 flex items-center gap-1"
                  title="Salin Link Registrasi"
                >
                  {copiedId === ev.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <a
                  href={`/e/${ev.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-xs py-2 px-3"
                  title="Buka Form"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 space-y-4 border border-white/20">
            <h3 className="text-lg font-bold text-white">
              {editingEvent ? "Edit Acara" : "Buat Acara Baru"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="input-label">Judul Acara *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Contoh: Grand Opening Toko Baru"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="input-label">Waktu Acara</label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="input-field text-sm"
                    placeholder="09:00 - 17:00 WIB"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Lokasi / Venue</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Gedung XYZ Lantai 2"
                />
              </div>

              <div>
                <label className="input-label">Deskripsi</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Informasi singkat acara..."
                />
              </div>

              <div>
                <label className="input-label">Kapasitas Maksimal (0 = Tanpa batas)</label>
                <input
                  type="number"
                  min="0"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-sm"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary text-sm">
                  Simpan Acara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
