import React, { useState, useEffect } from "react";
import { api, getAuthToken } from "./api";
import { GuestRegister } from "./pages/guest/GuestRegister";
import { TicketView } from "./pages/guest/TicketView";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminParticipants } from "./pages/admin/AdminParticipants";
import { AdminScanner } from "./pages/admin/AdminScanner";
import { AdminEvents } from "./pages/admin/AdminEvents";
import { AdminLayout } from "./components/AdminLayout";
import { Loader2 } from "lucide-react";

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

  // 2. Admin Portal: /admin
  if (path.startsWith("/admin")) {
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
              setActiveAdminTab("dashboard");
            }}
          />
        )}
      </AdminLayout>
    );
  }

  // 3. Guest Registration: /e/:slug or root /
  let eventSlug = "grand-opening";
  if (path.startsWith("/e/")) {
    eventSlug = currentPath.split("/e/")[1]?.split("/")[0] || "grand-opening";
  } else if (path.startsWith("/event/")) {
    eventSlug = currentPath.split("/event/")[1]?.split("/")[0] || "grand-opening";
  }

  return <GuestRegister slug={eventSlug} />;
}

export default App;
