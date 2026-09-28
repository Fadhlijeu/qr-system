const API_BASE = "/api";

/**
 * Origin that hosts the Admin Portal (login form + dashboard).
 *
 * - Production: the Express server serves this bundle itself, so the portal
 *   lives on the exact same origin as the page.
 * - Development: Vite (default :3000) only proxies `/api`; the Express server
 *   (`PORT=5000`) is the one that serves the admin portal, so the form has to be
 *   opened there. The hostname of the dev machine is reused so the redirect also
 *   works when the dev server is opened from a LAN IP. Override the whole origin
 *   with `VITE_SERVER_ORIGIN`.
 */
export const SERVER_ORIGIN = import.meta.env.DEV
  ? import.meta.env.VITE_SERVER_ORIGIN || `http://${window.location.hostname}:5000`
  : window.location.origin;

/** Dedicated URL of the admin login form (served by the API server only). */
export const ADMIN_LOGIN_URL = `${SERVER_ORIGIN}/login`;

/** True when the current page is already served from the admin portal origin. */
export function isAdminPortalOrigin() {
  return window.location.origin === SERVER_ORIGIN;
}

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

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    // Network-level failure: server down, wrong port, offline or blocked CORS.
    // Surface a readable message instead of the raw browser "Failed to fetch".
    throw new Error(
      `Tidak dapat terhubung ke server ${SERVER_ORIGIN}. Pastikan server sedang berjalan, lalu coba lagi.`
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "Terjadi kesalahan pada server");
  }

  return data;
}

export const api = {
  getConfig: () => request(`/config`),
  // Public Guest API
  getPublicEvents: () => request(`/events`),
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
  // Direct admin registration (no OTP email verification)
  registerAdmin: (name, email, password) =>
    request(`/auth/register`, {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  // OTP-based registration
  requestOtp: (name, email, password) =>
    request(`/auth/register/request-otp`, {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  verifyOtp: (email, otp) =>
    request(`/auth/register/verify-otp`, {
      method: "POST",
      body: JSON.stringify({ email, otp }),
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
  deleteEvent: (id) =>
    request(`/admin/events/${id}`, {
      method: "DELETE",
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
  checkInTicket: (code, eventId) =>
    request(`/admin/check-in`, {
      method: "POST",
      body: JSON.stringify({ code, event_id: eventId }),
    }),

  // Export CSV download link
  getExportUrl: (eventId) => {
    const token = getAuthToken();
    return `${API_BASE}/admin/events/${eventId}/export${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  },

  // Saved Locations (Reusable Venues)
  getSavedLocations: () => request(`/admin/locations`),
  createSavedLocation: (payload) =>
    request(`/admin/locations`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateSavedLocation: (id, payload) =>
    request(`/admin/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteSavedLocation: (id) =>
    request(`/admin/locations/${id}`, {
      method: "DELETE",
    }),

  // Organizer Settings & Homepage Design
  getOrganizerSettings: () => request(`/admin/organizer`),
  updateOrganizerSettings: (payload) =>
    request(`/admin/organizer`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getPublicOrganizer: () => request(`/organizer/public`),
};
