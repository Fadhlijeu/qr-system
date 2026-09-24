import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  QrCode,
  Calendar,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Ticket
} from "lucide-react";
import { setAuthToken } from "../api";

export function AdminLayout({
  activeTab,
  setActiveTab,
  admin,
  onLogout,
  currentEvent,
  children
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = () => {
    setAuthToken(null);
    if (onLogout) onLogout();
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "participants", label: "Peserta", icon: Users },
    { id: "scanner", label: "QR Scanner", icon: QrCode },
    { id: "events", label: "Acara", icon: Calendar },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileDrawerOpen(false);
  };

  // Extract initials for avatar
  const initials = admin?.name
    ? admin.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0e1322] border-r border-white/5">
      {/* Brand / Logo */}
      <div className="p-5 border-b border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
          <Ticket className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-sm text-white tracking-tight leading-tight truncate">
            QR Event
          </h1>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">
            Management System
          </span>
        </div>
      </div>

      {/* Current Event Context Badge */}
      {currentEvent && (
        <div className="px-4 pt-4 pb-2">
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
                Acara Aktif
              </span>
              <p className="text-xs font-semibold text-slate-200 truncate">
                {currentEvent.title}
              </p>
            </div>
            <button
              onClick={() => handleNavClick("events")}
              className="text-[10px] text-slate-400 hover:text-white transition-colors underline shrink-0"
              title="Ganti Acara"
            >
              Ganti
            </button>
          </div>
        </div>
      )}

      {/* Main Nav Items */}
      <div className="flex-1 py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
            </button>
          );
        })}
      </div>

      {/* Footer / Admin Profile */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-200 block truncate">
                {admin?.name || "Admin"}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                {admin?.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] flex text-slate-100">
      <div className="bg-ambient-clean" />

      {/* Desktop Sidebar (Fixed 250px) */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Topbar */}
        <header className="h-14 border-b border-white/5 bg-[#0e1322]/80 backdrop-blur-md sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 hidden sm:inline">Admin Portal</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="font-semibold text-white capitalize">
                {navItems.find((n) => n.id === activeTab)?.label || "Dashboard"}
              </span>
            </div>
          </div>

          {/* Topbar Right Actions */}
          <div className="flex items-center gap-3">
            {currentEvent && (
              <a
                href={`/e/${currentEvent.slug}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/5 transition-colors"
                title="Buka Halaman Form Tamu"
              >
                <span>Halaman Tamu</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              </a>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-white/5">
              <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-[11px] font-bold text-indigo-300">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
