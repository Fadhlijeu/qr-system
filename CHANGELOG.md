# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] - 2026-09-24

### Added
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
- **Pure Random Public URLs**:
  - Event registration slugs are now generated as pure unguessable alphanumeric tokens (`/e/evt-[random20]`) with no event title leakage, set to read-only in forms.
- **Git Hygiene**:
  - Added `_adminator_ref/` and temporary dump files to `.gitignore` to keep repositories clean.

### Fixed
- **Map Tile 403 Access Blocked**:
  - Replaced OpenStreetMap standard tile servers (`tile.openstreetmap.org`, which strictly blocks third-party web apps and development servers with HTTP 403 hazard tiles per their Tile Usage Policy) with high-performance **CartoDB Voyager** raster tiles backed by global Fastly CDN. Map now renders with zero rate limits or 403 blocks.
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
