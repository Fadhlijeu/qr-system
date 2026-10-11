# QR System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square)
![Runtime](https://img.shields.io/badge/runtime-Node.js%2022%2B%20%7C%20node:sqlite-green.svg?style=flat-square)
![Frontend](https://img.shields.io/badge/frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-61DAFB.svg?style=flat-square)
![Backend](https://img.shields.io/badge/backend-Express.js-000000.svg?style=flat-square)
![Database](https://img.shields.io/badge/database-Native%20SQLite-003B57.svg?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-success.svg?style=flat-square)

**Universal Event Registration, E-Ticketing & High-Speed QR Check-in Platform**  
*Ultra-lightweight, zero-maintenance event management designed for high-throughput guest reception.*

[System Overview](#-overview) • [Dual Portals](#-dual-portal-architecture) • [Workflow](#-system-workflow) • [Quick Start](#-quick-start) • [Feature Flags](#-feature-flags--configuration) • [Project Structure](#-project-structure)

</div>

---

## 🌟 Overview

**QR System** is an independent, high-performance event registration and QR check-in platform engineered for speed, simplicity, and zero maintenance overhead.

Whether organizing **Grand Openings**, **Corporate Summits**, **Tech Conferences**, **Product Launches**, or **VIP Receptions**, QR System delivers a seamless, friction-free experience for attendees and gives event organizers a real-time command dashboard at the registration desk.

Built as an independent full-stack application using **Node.js (Express) + Native SQLite (`node:sqlite`) + React (Vite & Tailwind CSS)**, it eliminates heavy database daemon dependencies (PostgreSQL/MySQL/Redis) and runs effortlessly anywhere.

---

## 🎯 Dual-Portal Architecture

### 1. Guest Registration Portal (`/e/:slug`)
- **Direct Link Access**: Attendees visit the branded event URL and register in seconds.
- **Minimal, Frictionless Form**:
  - Full Name (Nama Lengkap)
  - WhatsApp Number
  - Email Address
  - Company / Organization / Institution
- **Zero Friction**: No passwords, no required account creation, and no app installation.
- **Instant Cryptographic E-Ticket**: Immediately generates a unique, cryptographically secure ticket code (`TKT-XXXXXX`) with an scannable QR code.
- **Ticket Preservation**: Attendees can save the high-resolution QR image or print the boarding-pass style ticket directly to Apple Wallet / mobile gallery.

### 2. Admin Command Center (`/admin`)
- **Secure Access**: JWT-based authentication with configurable admin registration controls.
- **Event Management**: Create and configure multiple events (name, slug, date, time, location, capacity, cover banner).
- **Real-Time KPI Dashboard**:
  - Total Registered Attendees
  - Checked-In Count
  - Pending Arrivals (Belum Hadir)
  - Live Attendance Rate %
  - Auto-refreshing 15s polling & instant window-focus sync
- **High-Speed QR Scanner**:
  - Integrated live camera scanner with high-frame barcode decoding.
  - Hardware USB HID scanner support and keyboard-wedge input.
  - Manual code search fallback.
  - Audio and visual instant verification states:
    - 🟢 **CHECK-IN SUCCESS** — Ticket verified and marked as attended.
    - 🟡 **ALREADY CHECKED IN** — Warning alert with previous check-in timestamp.
    - 🔴 **INVALID QR** — Alert for fraudulent or mismatched tickets.
- **Interactive Attendee Table**: Full search, filtering by status, manual toggle check-in, and 1-click WhatsApp messaging links.
- **Data Export**: Clean CSV download with attendee details and check-in timestamps ready for post-event analytics.

---

## 🔄 System Workflow

```text
  Guest Visits (/e/:slug)
            │
            ▼
  [ Fill Minimal Form ] ────► Cryptographic Token Generated (TKT-XXXXXX)
            │                                 │
            ▼                                 ▼
   [ Instant E-Ticket ]               Saved in node:sqlite
  (Download QR / Print)                       │
                                              │
  =================== AT THE VENUE ============│======================
                                              │
  Check-in Desk Scanner (/admin) ◄────────────┘
            │
     [ Scan QR Code ]
            │
   ┌────────┴────────────────────────┬────────────────────────┐
   ▼                                 ▼                        ▼
🟢 VALID TICKET                  🟡 DUPLICATE TICKET       🔴 INVALID
Marks Checked-in with timestamp   Displays previous time    Rejects invalid code
Audio Chime: Success              Audio Chime: Warning      Audio Chime: Error
```

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) | Ultra-fast client build & responsive interface |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Modern utility-first responsive layout |
| **QR Handling** | `html5-qrcode` + `qrcode.react` | High-speed webcam scanner & dynamic QR generation |
| **Backend** | [Express](https://expressjs.com/) | RESTful API server with JWT authentication |
| **Database** | Native SQLite (`node:sqlite`) | Embedded zero-config ACID database in Node 22+ |
| **Security** | Helmet, CORS, Rate-Limiting, BcryptJS | Production-grade security middleware suite |

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: v22+ or v24+ *(uses native `node:sqlite` module)*
- **npm**: v9+

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Fadhlijeu/qr-system.git
cd qr-system

# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Build Frontend

```bash
npm run build
```

### 3. Start Production Server

```bash
npm start
```
The application will launch at `http://localhost:5000`.

### 4. Local Development (Hot Reloading)

```bash
# Run both Backend (:5000) and Frontend Vite (:3000) concurrently:
npm run dev

# Or run separately in two terminals:
# Terminal 1: Backend Express API
npm run dev:server

# Terminal 2: Frontend Vite hot-reload
npm run dev:client
```

---

## 🔑 Default Admin Credentials

- **Admin Login Portal**: `http://localhost:5000/login` (Dashboard: `/admin`)
- **Default Email**: `fadhli@gmail.com`
- **Default Password**: `GrandOpening2026!`
- **Sample Event**: `http://localhost:5000/e/grand-opening`

> 💡 **Resetting Admin Accounts:** SQLite data is stored in `server/data/events.db` (git-ignored). To wipe and reset to the default account, remove the file (`del server\data\events.db*` on Windows or `rm -f server/data/events.db*` on Linux/macOS) and restart the server.

---

## ⚙️ Feature Flags & Configuration

Environment variables can be placed in `.env` in the project root or `server/.env`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port for Express API server |
| `JWT_SECRET` | `super-secret-key` | Secret key for JWT signing |
| `ENABLE_ADMIN_REGISTRATION` | `true` | Allows or restricts public admin account creation |
| `ENABLE_ADMIN_OTP_REGISTRATION` | `false` | Requires OTP email verification before admin activation |

```bash
ENABLE_ADMIN_REGISTRATION=true        # Set false to close registration once admins exist
ENABLE_ADMIN_OTP_REGISTRATION=false   # Set true if email OTP verification is required
```

---

## 🔔 Modular Notification Providers

Located in `server/src/notifications/`:
- **`emailProvider.js`**: Simulated / SMTP email delivery for registration confirmations & admin OTPs.
- **`whatsappProvider.js`**: Clean, pluggable stub ready to connect with any WhatsApp gateway API (e.g. Fonnte, Waha, Baileys, Twilio) without changing business logic.

---

## 📁 Project Structure

```text
qr-system/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── guest/          # Guest registration & Ticket view
│   │   │   └── admin/          # Admin Dashboard, Scanner & Event Setup
│   │   ├── components/         # TicketCard, Navbar, Modals
│   │   └── api.js              # Lightweight API client
│   └── package.json
│
├── server/                     # Express Backend
│   ├── src/
│   │   ├── routes/             # Admin, Guest, Auth & Event routes
│   │   ├── notifications/      # Modular Notification Providers
│   │   ├── db.js               # Native SQLite auto-migrations & seed
│   │   ├── auth.js             # JWT authentication middleware
│   │   └── index.js            # Express server entry point
│   └── package.json
│
└── package.json                # Root scripts & workspaces
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
