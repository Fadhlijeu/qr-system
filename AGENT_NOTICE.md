# 🛡️ AGENT NOTICE — QR GRAND-OPENING (CUSTOM EVENT REGISTRATION SYSTEM)

> **CRITICAL COMPASS & MANDATORY DIRECTIVES FOR ALL AGENTS WORKING ON THIS PROJECT**
> **Source of Truth**: [`brain.md`](file:///d:/PROJECT/QR%20grand-opening/brain.md)

---

## ⛔ STRICT CONSTRAINTS & NON-GOALS (LARANGAN KERAS)

1. **JANGAN PERNAH REWRITE / BIKIN DARI NOL**:
   - Base project adalah repository open-source **Hi.Events** (Laravel 11 + React 18 / Mantine UI + PostgreSQL + Redis).
   - Seluruh fungsi inti (ticketing, attendee management, order generation, QR generation, QR browser scanning, check-in validation, double check-in prevention, export CSV/XLSX) **SUDAH TERSEDIA LENGKAP**.
   - **REUSE HI.EVENTS. DO NOT REBUILD HI.EVENTS.**

2. **JANGAN MERUSAK STACK UTAMA**:
   - Dilarang mengganti framework backend (tetap Laravel).
   - Dilarang mengganti framework frontend (tetap React + Vite SSR).
   - Dilarang mengganti database (tetap PostgreSQL).
   - Dilarang menambah framework/library acak yang tidak perlu.

3. **FITUR YANG DILARANG DI V1**:
   - ❌ Dilarang integrasi WhatsApp (belum untuk V1: no WABA, no WhatsApp Cloud API, no puppet automation).
   - ❌ Dilarang integrasi payment gateway / Stripe / paid tickets / tax / refund / invoice paid checkout.
   - ❌ Dilarang membuat aplikasi mobile terpisah / APK (scanner harus berbasis browser di `/check-in/...`).
   - ❌ Dilarang membuat sistem QR/check-in kedua (gunakan check-in scanner existing di `frontend/src/components/layouts/CheckIn`).

4. **STRATEGI MODIFIKASI**:
   - Prioritas eliminasi fitur yang tidak dipakai:
     1. **Disable** via config/settings
     2. **Hide** dari UI
     3. **Remove** unnecessary routes
     4. **Remove** dependencies hanya jika 100% aman
   - Dilarang menghapus ribuan baris kode core hanya demi "merapikan".

5. **GOVERNANCE & MEMORY**:
   - Setiap akhir sesi kerja, agent **WAJIB** mencatat progres lengkap di [`progress.md`](file:///d:/PROJECT/QR%20grand-opening/progress.md).
   - Jangan pernah melangkah ke fase berikutnya tanpa persetujuan user.

---

## 🎯 TARGET PRODUK V1

- **Public**:
  Event Landing (`/e/:eventId/:slug` atau `/event`) → Form Registrasi Anonim/Tanpa Akun → Konfirmasi & E-Tiket Personal dengan QR Code unik (`/product/:eventId/:attendeeShortId`).
- **Admin & Staff**:
  Login → Dashboard Kehadiran (Realtime Attendance, bukan sales chart) → Manajemen Peserta (Search, Filter, Detail, Manual Check-in, Export Excel/CSV) → QR Scanner Kamera Browser (`/check-in/:checkInListShortId`).
