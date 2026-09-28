# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] - 2026-09-24

### Added
- **Desain Tampilan Tamu (`AdminHomepageDesign` / Guest Experience Customizer)**:
  - Reoriented design tool specifically for the attending guest experience rather than an organizer profile.
  - Live split preview with tab switcher between **Form Registrasi Tamu** (`/e/:slug`) and **E-Ticket Tamu** (`/t/:ticketCode`).
  - Customizer controls for guest visual branding (Banner Cover Tamu & Logo Acara), guest accent color presets/picker, mode tamu (Light/Dark), font typography, and custom arrival instructions.
  - Dynamic theme integration: `GuestRegister.jsx`, `TicketView.jsx`, and `TicketCard.jsx` automatically fetch and apply the active theme colors, font family, banner, and logo for visiting guests.
- **Saved Locations / Reusable Venues (`AdminLocations`)**:
  - Dedicated venue management screen with empty state ("No Saved Locations"), custom venue creation, interactive map coordinate pin, capacity limits, and Google Maps shortcuts.
  - Automatic venue caching: any new venue/address entered during event creation is automatically cached to `saved_locations`.
  - 1-click location quick-picker dropdown in Event Creation/Edit modal to auto-populate venue, address, coordinates, and capacity.
- **Homepage Design & Organizer Live Customizer (`AdminHomepageDesign`)**:
  - Live split-view visual editor allowing organizers to brand their public portal:
    - **Images**: Custom cover image upload and circular logo avatar upload with instant preview.
    - **Theme & Colors**: Hex color pickers and preset swatches for Accent Color and Background Color, with Light/Dark color mode toggle and automatic contrast warning detection.
    - **Typography**: Typeface selector (Outfit, Inter, Plus Jakarta Sans, Poppins, Roboto) with live preview phrase.
    - **Live Real-time Mockup**: Interactive desktop canvas rendering live changes, organizer bio, contact button, and tabbed upcoming/past event cards.
- **Organizer Settings (`AdminSettings`)**:
  - Hi.Events-style settings sub-navigation: Basic Information, Event Defaults, Payouts & Fees (Free/Zero-Fee model), Social Links, SEO & Meta tags, Custom Email Ticket Templates, and Analytics Tracking IDs (GA4 & Meta Pixel).
- **Public Organizer Portal (`/org`)**:
  - Branded guest-facing homepage displaying the organizer's active events, contact links, and custom styling.
- **Interactive Map Location Picker (`LocationMapPicker`)**:
  - Keybinds: Left-click for smooth hover and map panning; Right-click (`contextmenu`) for placing/dropping points and auto-reverse-geocoding without accidental pin shifts.
  - Interactive pin-drop and draggable marker anywhere on the map via Leaflet & OpenStreetMap.
  - Real-time reverse geocoding: automatically resolves clicked/dragged coordinates into readable venue/street names and populates the location form input.
  - Built-in location search bar with instant autocomplete suggestions for buildings, hotels, roads, and cities.
  - Pre-input support: opening the map with an existing address pre-centers the map and places the pin automatically.
  - Device GPS auto-detection button ("GPS Saya") for rapid current location pinning.
  - Quick action to open selected coordinates or address directly in Google Maps.
  - Cleaned UI: eliminated beginner dummy badge text.
- **Enhanced Event Time Picker**:
  - Start time and end time inputs with timezone selectors (`WIB`, `WITA`, `WIT`).
- **Two-Step Event Deletion Confirmation**:
  - Step 1: Warning modal summarizing impacted guests.
  - Step 2: Verification modal requiring panitia to type the exact event title before permanent deletion.
- **Full-Ratio Event Banner Display & Fadeout**:
  - Full-ratio widescreen display image across Dashboard hero, Event cards, Guest Registration, and E-Ticket cards.
  - Gradient fadeout overlay seamlessly melts banner bottom directly into the event title.
- **Interactive Venue Locations**:
  - Clicking any event venue/location text immediately opens Google Maps in a new tab.

### Changed
- **Sidebar Left-Alignment & Google Outline Icons (`AdminLayout`)**:
  - Eliminated awkward center-aligned text in sidebar navigation buttons; all menu items are now strictly left-aligned with a neat, unified 12px gap between icon and label.
  - Replaced all emojis across navigation menus, `AdminSettings` submenus, and `AdminHomepageDesign` controls with authentic Google Material Symbols Outlined SVG icons (`stroke-width="1.8"`).
  - Enhanced active navigation state with a crisp left accent indicator bar, soft primary tint, and bold typography.
- **Pure Random Public URLs**:
  - Event registration slugs are now generated as pure unguessable alphanumeric tokens (`/e/evt-[random20]`) with no event title leakage, set to read-only in forms.
- **Git Hygiene**:
  - Added `_adminator_ref/` and temporary dump files to `.gitignore` to keep repositories clean.
- **Admin Portal Access & Dedicated Login URL**:
  - The admin login form is now served exclusively by the API server (`http://localhost:5000/login`); the portal itself stays on `/admin`.
  - Opening `/admin` or `/login` from any other origin (e.g. the Vite dev server on `:3000`) now forwards the browser to `http://localhost:5000/login` instead of rendering a login form that cannot reach the API.
  - Admin URLs are canonicalized client-side: `/login` while signed out, `/admin` once signed in.
  - The API origin used for that redirect is derived from the current hostname (`VITE_SERVER_ORIGIN` env override for custom hosts/ports).

### Removed
- **Pengaturan (Settings) Pruning (`AdminSettings`)**:
  - Removed unwanted SaaS sections: `Biaya Platform`, `Payouts & Rekening`, `SEO & Meta Tags`, `Tracking & Analytics`, and `Danger Zone`.
  - Retained an ultra-clean, focused settings menu: Basic Information, Event Defaults, Address (Saved Venues), Social Links, and Email Templates.

### Fixed
- **Vertical Alert / Error Messages (`AdminLogin`)**:
  - Auth alerts placed a bare `<span>` inside the three-column `.alert` grid (`24px 1fr auto`), so the message was squeezed into the 24px icon track and wrapped one word per line (`Failed / to / fetch`).
  - Login, registration, OTP-warning and success alerts now use the standard `ico` + `body` structure, and `index.css` gained an alert-grid safety net that pushes any message child into the flexible column and keeps the text flowing horizontally.
  - Raw browser network failures (`Failed to fetch`) are now translated into a readable Indonesian message naming the server origin that could not be reached.
- **Dashboard Label Visibility**:
  - Restored clear and prominent `Dashboard` title and eyebrow labels on both active event views and empty states in `AdminDashboard`, ensuring users always have clear section context.
- **Map Tile Watermark & Access Blocked (ESRI World Street Map)**:
  - Replaced tile provider with high-performance **ESRI World Street Map** (`server.arcgisonline.com`). Completely eliminates OpenStreetMap 403 hazard tiles and removes CartoDB diagonal "API KEY REQUIRED" watermarks, offering clean, crisp Indonesian street mapping with zero rate limits and no API key requirement.
- **Accidental Modal Dismissal on Outside Click**:
  - Disabled backdrop click-to-close behavior on event creation, event edit, and event deletion modal dialogs. Panitia can now freely click around and type inputs without accidental dismissal or lost progress; dialogs can only be closed via the explicit `✕` or `Batal` buttons.
- **Check-in Scanner Exception Handling**:
  - Resolved `Cannot read properties of undefined (reading 'name')` crash when scanning invalid or unregistered tickets.
  - Added strict guard branching for `INVALID` ticket responses and sanitized error messages so raw JavaScript runtime exceptions never surface to panitia.
  - Cleaned server check-in responses by removing technical prefix labels (`INVALID QR:`, `ALREADY CHECKED IN:`, `CHECK-IN SUCCESS:`) in favor of clear Indonesian messaging.
- **Redundant Event Creation Buttons & Dummy Text**:
  - Eliminated duplicate `+ Buat Acara Baru` button from the header when no events exist, leaving a single clean call-to-action inside the empty state.
  - Removed beginner hand-holding dummy text (`Klik tombol di bawah untuk menambahkan acara baru.` and explanatory paragraphs) in both `AdminEvents` and `AdminDashboard`.
- **Map Search Form Isolation**:
  - Replaced nested `<form>` in `LocationMapPicker` with isolated search controls to prevent accidental submission of the outer event creation form and unwanted redirects to the dashboard.
- **Dashboard Empty State Navigation**:
  - Clicking "Buat Acara Pertama" in `AdminDashboard` now directly navigates to the Events tab instead of triggering a full page reload.
- **Delete Modal Layout**:
  - Fixed vertical text distortion on confirmation buttons and resolved server delete route exceptions.

### Security
- **Defense-in-Depth & Hi.Events Security Parity**:
  - **HTTP Security Headers (`helmet`)**: Enforced `HSTS`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and hidden `X-Powered-By`.
  - **Rate Limiting (`express-rate-limit`)**:
    - Brute-force protection on `/api/auth/login` (max 10 attempts / 15m).
    - Anti-spam & email bombing protection on OTP request (max 5 requests / 10m).
    - Anti-bot flood on guest registration (max 20 registrations / 10m).
    - QR scanning abuse throttle on check-in scanner (max 120 scans / min).
  - **Broken Access Control / IDOR Prevention**: Scoped all admin operations (`PUT /events/:id`, `DELETE /events/:id`, `dashboard`, `participants`, `export`, `toggle-checkin`, and `check-in`) to verified admin ownership.
  - **Check-in Concurrency Race Condition**: Switched to atomic conditional `UPDATE participants SET checked_in = 1 ... WHERE id = ? AND checked_in = 0` to prevent double check-ins.
  - **Event Capacity Race Condition**: Enforced SQLite `BEGIN IMMEDIATE` transactions to prevent overbooking past capacity.
  - **CSV Formula Injection Neutralization**: Neutralized formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) in participant CSV export.
  - **Information Disclosure Remediation**: Removed server boot console credential logging and updated `nodemailer` to v10.0.10 (0 vulnerabilities on `npm audit`).
