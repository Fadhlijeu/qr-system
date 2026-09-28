import React, { useState, useEffect } from "react";
import { api, getAuthToken, isAdminPortalOrigin, ADMIN_LOGIN_URL } from "./api";
import { GuestRegister } from "./pages/guest/GuestRegister";
import { TicketView } from "./pages/guest/TicketView";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminParticipants } from "./pages/admin/AdminParticipants";
import { AdminScanner } from "./pages/admin/AdminScanner";
import { AdminEvents } from "./pages/admin/AdminEvents";
import { AdminLocations } from "./pages/admin/AdminLocations";
import { AdminHomepageDesign } from "./pages/admin/AdminHomepageDesign";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { GuestOrganizer } from "./pages/guest/GuestOrganizer";
import { AdminLayout } from "./components/AdminLayout";
import { Loader2 } from "lucide-react";

/**
 * Shown when the admin portal is loaded from an origin that is not the API
 * server (e.g. the Vite dev server on :3000). The login form must not be
 * reachable from there, so the browser is forwarded to the API server instead.
 */
function RedirectingToAdminPortal() {
  useEffect(() => {
    window.location.replace(ADMIN_LOGIN_URL);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-2 px-6 text-center text-xs text-slate-500">
      <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
      <span>Mengalihkan ke portal admin di {ADMIN_LOGIN_URL} …</span>
      <a href={ADMIN_LOGIN_URL} className="font-semibold text-slate-800 underline">
        Buka {ADMIN_LOGIN_URL}
      </a>
    </div>
  );
}

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [adminUser, setAdminUser] = useState(null);
  const [activeAdminTab, setActiveAdminTab] = useState("dashboard");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Check auth session
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await api.getMe();
          setAdminUser(res.admin);
        } catch (err) {
          setAdminUser(null);
        }
      }
      setAuthChecking(false);
    };
    checkAuth();
  }, []);

  // Keep admin URLs canonical: the login form lives on `/login` and the portal
  // lives on `/admin`, both only on the API server origin.
  useEffect(() => {
    const current = currentPath.toLowerCase();
    const isAdminRoute = current.startsWith("/admin") || current === "/login";
    if (!isAdminRoute || !isAdminPortalOrigin() || authChecking) return;

    const canonical = adminUser ? "/admin" : "/login";
    if (current !== canonical) {
      window.history.replaceState({}, "", canonical);
      setCurrentPath(canonical);
    }
  }, [currentPath, adminUser, authChecking]);

  // Fetch events list and auto-select active event
  useEffect(() => {
    if (adminUser) {
      api
        .getEvents()
        .then((res) => {
          if (res.events && res.events.length > 0) {
            const matched = res.events.find((e) => e.id === selectedEventId) || res.events[0];
            setSelectedEventId(matched.id);
            setCurrentEvent(matched);
          } else {
            setSelectedEventId(null);
            setCurrentEvent(null);
          }
        })
        .catch(() => {});
    }
  }, [adminUser, selectedEventId]);

  // Parse path
  const path = currentPath.toLowerCase();

  // 1. Direct Ticket view: /t/:ticketCode
  if (path.startsWith("/t/")) {
    const ticketCode = currentPath.split("/t/")[1]?.split("/")[0];
    return <TicketView ticketCode={ticketCode} />;
  }

  // 2. Admin Portal: /login (login form) and /admin (dashboard)
  if (path.startsWith("/admin") || path === "/login") {
    // The login form is only served from the API server origin. Anywhere else
    // (e.g. the Vite dev server on :3000) the browser is forwarded to the real
    // admin portal instead of rendering a login form that cannot reach the API.
    if (!isAdminPortalOrigin()) {
      return <RedirectingToAdminPortal />;
    }

    if (authChecking) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-xs text-slate-500 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
          <span>Memeriksa sesi login...</span>
        </div>
      );
    }

    if (!adminUser) {
      return <AdminLogin onLoginSuccess={(user) => setAdminUser(user)} />;
    }

    return (
      <AdminLayout
        activeTab={activeAdminTab}
        setActiveTab={setActiveAdminTab}
        admin={adminUser}
        onLogout={() => setAdminUser(null)}
        currentEvent={currentEvent}
      >
        {activeAdminTab === "dashboard" && (
          <AdminDashboard
            eventId={selectedEventId}
            onNavigateToScanner={() => setActiveAdminTab("scanner")}
            onNavigateToParticipants={() => setActiveAdminTab("participants")}
            onNavigateToEvents={() => setActiveAdminTab("events")}
          />
        )}

        {activeAdminTab === "participants" && (
          <AdminParticipants eventId={selectedEventId} />
        )}

        {activeAdminTab === "scanner" && (
          <AdminScanner
            eventId={selectedEventId}
            onCheckInComplete={() => {}}
          />
        )}

        {activeAdminTab === "events" && (
          <AdminEvents
            selectedEventId={selectedEventId}
            onSelectEvent={(id) => {
              setSelectedEventId(id);
              // Stay on the events tab while managing events.
              // Creating/selecting an event here must NOT bounce the user back
              // to the dashboard (that made the list appear to "not open").
            }}
          />
        )}

        {activeAdminTab === "locations" && (
          <AdminLocations />
        )}

        {activeAdminTab === "design" && (
          <AdminHomepageDesign
            onNavigateToCreateEvent={() => setActiveAdminTab("events")}
          />
        )}

        {activeAdminTab === "settings" && (
          <AdminSettings
            onNavigateToLocations={() => setActiveAdminTab("locations")}
          />
        )}
      </AdminLayout>
    );
  }

  // 3. Public Organizer Homepage: /org or /organizer
  if (path === "/org" || path.startsWith("/org/") || path === "/organizer" || path.startsWith("/organizer/")) {
    return <GuestOrganizer />;
  }

  // 4. Guest Registration: /e/:slug or root /
  // Explicit slug from the URL takes priority; otherwise wait for the first
  // public event to be resolved (no hardcoded placeholder event name).
  let eventSlug = null;
  if (path.startsWith("/e/")) {
    eventSlug = currentPath.split("/e/")[1]?.split("/")[0] || null;
  } else if (path.startsWith("/event/")) {
    eventSlug = currentPath.split("/event/")[1]?.split("/")[0] || null;
  }

  return <GuestRegister slug={eventSlug} />;
}

export default App;
