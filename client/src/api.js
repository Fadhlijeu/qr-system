const API_BASE = "/api";

export function getAuthToken() {
  return localStorage.getItem("admin_token");
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("admin_token", token);
  } else {
    localStorage.removeItem("admin_token");
  }
}

async function request(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "Terjadi kesalahan pada server");
  }

  return data;
}

export const api = {
  getConfig: () => request(`/config`),
  // Public Guest API
  getPublicEvent: (slug) => request(`/events/${slug}`),
  registerGuest: (slug, payload) =>
    request(`/events/${slug}/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getTicket: (ticketCode) => request(`/tickets/${ticketCode}`),

  // Admin Auth
  login: (email, password) =>
    request(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  registerAdmin: (name, email, password) =>
    request(`/auth/register`, {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  getMe: () => request(`/auth/me`),

  // Admin Event Management
  getEvents: () => request(`/admin/events`),
  createEvent: (payload) =>
    request(`/admin/events`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateEvent: (id, payload) =>
    request(`/admin/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Admin Dashboard & Participants
  getDashboard: (eventId) => request(`/admin/events/${eventId}/dashboard`),
  getParticipants: (eventId, { search = "", status = "all" } = {}) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (status && status !== "all") query.set("status", status);
    return request(`/admin/events/${eventId}/participants?${query.toString()}`);
  },
  toggleCheckIn: (participantId) =>
    request(`/admin/participants/${participantId}/toggle-checkin`, {
      method: "POST",
    }),

  // QR Scanner Check-in
  checkInQR: (code, eventId) =>
    request(`/admin/check-in`, {
      method: "POST",
      body: JSON.stringify({ code, event_id: eventId }),
    }),

  // Export CSV download link
  getExportUrl: (eventId) => {
    const token = getAuthToken();
    return `${API_BASE}/admin/events/${eventId}/export${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  },
};
