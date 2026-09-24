# Minimal Event Registration & QR Check-in System

A lightweight, high-performance event registration and QR check-in platform designed for speed, simplicity, and zero maintenance overhead.

Built as an independent, single-process application with **Node.js (Express) + Native SQLite (`node:sqlite`) + React (Vite & Tailwind CSS)**.

---

## 🎯 System Overview

Strictly divided into two simple sides:

### 1. ADMIN (`/admin`)
- **Login**: Secure JWT authentication.
- **Event Setup**: Create and customize events (date, time, location, capacity).
- **Shareable Link**: Instant one-click copy of the public registration URL (`/e/:slug`).
- **Dashboard**: Real-time metrics (Total Registered, Checked-in, Not Checked-in, Attendance %), and recent check-ins stream.
- **Participants**: Filterable and searchable attendee table with manual check-in toggle and direct WhatsApp links.
- **QR Scanner**: Live camera barcode scanner + manual code input with audio beeps and 3 instant states:
  - 🟢 **CHECK-IN SUCCESS** (Valid ticket, marks attendee as present)
  - 🟡 **ALREADY CHECKED IN** (Duplicate scan warning with previous check-in time)
  - 🔴 **INVALID QR** (Fake or mismatched event ticket)
- **Data Export**: Clean CSV download with attendee details and check-in timestamps.

### 2. GUEST (`/e/:slug`)
- **Direct Access**: Guest clicks the event link and immediately sees the clean registration form.
- **Minimal Form**:
  - Nama Lengkap (Full Name)
  - Nomor WhatsApp
  - Alamat Email
  - Instansi / Organisasi / Perusahaan
- **Instant E-Ticket**: Submit directly generates an E-Ticket with a unique, cryptographically random QR code (`TKT-XXXXXX`).
- **Zero Friction**: No passwords, no login, no checkout, no payment tiers.
- **Save Ticket**: Guests can instantly save/download the QR code image or print the boarding-pass style ticket.

---

## ⚡ Quick Start

### Prerequisites
- Node.js v22 or v24+ (uses native `node:sqlite`)

### 1. Install Dependencies
```bash
npm install
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
The server will start at `http://localhost:5000`.

### 4. For Local Development (Hot Reloading)
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend (Vite)
npm run client
```

---

## 🔑 Default Admin Credentials

- **URL**: `http://localhost:5000/admin`
- **Email**: `fadhli@gmail.com`
- **Password**: `GrandOpening2026!`
- **Sample Event**: `http://localhost:5000/e/grand-opening`

---

## 📁 Project Structure

```
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── guest/          # Guest registration form & Ticket viewer
│   │   │   └── admin/          # Admin Dashboard, Scanner, Participants & Events
│   │   ├── components/         # TicketCard & Navbar
│   │   └── api.js              # Lightweight API client
├── server/                     # Express Backend
│   ├── src/
│   │   ├── routes/             # Admin, Guest & Auth routes
│   │   ├── notifications/      # Modular notification providers (Email, WhatsApp stub)
│   │   ├── db.js               # Native SQLite auto-migration & seed
│   │   ├── auth.js             # JWT auth middleware
│   │   └── index.js            # Express server
└── package.json                # Root scripts & workspaces
```

---

## 🔔 Modular Notification Architecture

Located in `server/src/notifications/`:
- **`emailProvider.js`**: Simulated/SMTP email notification on registration.
- **`whatsappProvider.js`**: Clean stub interface ready to plug in any WhatsApp Gateway (e.g. Fonnte, Waha, Baileys, Twilio) without modifying core registration or check-in logic.
