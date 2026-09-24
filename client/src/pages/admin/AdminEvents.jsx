import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { EventCard } from "../../components/EventCard";
import { Plus, Calendar, Sparkles, X, Loader2 } from "lucide-react";

export function AdminEvents({ onSelectEvent, selectedEventId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

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
    api.getConfig().then(setConfig).catch(() => {});
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
    setErrorMessage(null);
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
    setErrorMessage(null);
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
    setSaving(true);
    setErrorMessage(null);
    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, form);
      } else {
        await api.createEvent(form);
      }
      setShowModal(false);
      loadEvents();
    } catch (err) {
      setErrorMessage(err.message || "Gagal menyimpan data acara.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Manajemen Acara
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pilih acara untuk melihat dashboard kehadiran atau buat acara baru
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Acara Baru</span>
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-pro h-72 skeleton" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="card-pro p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Belum Ada Acara</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Anda belum membuat acara. Mulai dengan membuat acara pertama Anda untuk mendapatkan link pendaftaran tamu dan QR Scanner.
            </p>
          </div>
          <button onClick={handleOpenCreate} className="btn-primary text-xs">
            <Plus className="w-4 h-4" /> Buat Acara Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              isSelected={selectedEventId === ev.id}
              onSelect={() => onSelectEvent(ev.id)}
              onEdit={handleOpenEdit}
              guestBaseUrl={config?.guestDomain}
            />
          ))}
        </div>
      )}

      {/* Modal Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-pro max-w-lg w-full p-6 space-y-4 border border-white/20 bg-[#131b2e] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingEvent ? "Edit Informasi Acara" : "Buat Acara Baru"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="input-label">Judul Acara *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const autoSlug = newTitle
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    setForm({
                      ...form,
                      title: newTitle,
                      slug: editingEvent ? form.slug : autoSlug,
                    });
                  }}
                  className="input-field text-sm"
                  placeholder="Contoh: Grand Opening Cabang Surabaya"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="input-label mb-0">Slug / Link Unik Tamu *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = "ev-" + Math.random().toString(36).substring(2, 8);
                      setForm({ ...form, slug: rand });
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
                  >
                    🎲 Buat Acak Unik
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-2 rounded-lg border border-white/10 shrink-0">
                    /e/
                  </span>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                    className="input-field text-sm font-mono"
                    placeholder="link-unik-event"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tautan tamu: <span className="text-indigo-300 font-mono">{config?.guestDomain || window.location.origin}/e/{form.slug || "link-unik"}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Tanggal Acara *</label>
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
                  placeholder="Contoh: Ballroom Hotel Grand Sahid, Jakarta"
                />
              </div>

              <div>
                <label className="input-label">Deskripsi Singkat</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field text-sm resize-none"
                  placeholder="Informasi pengantar untuk calon tamu..."
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

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingEvent ? "Simpan Perubahan" : "Buat Acara"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
