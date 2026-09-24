# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] - 2026-09-24

### Added
- **Interactive Map Location Picker (`LocationMapPicker`)**:
  - Interactive pin-drop and draggable marker anywhere on the map via Leaflet & OpenStreetMap.
  - Real-time reverse geocoding: automatically resolves clicked/dragged coordinates into readable venue/street names and populates the location form input.
  - Built-in location search bar with instant autocomplete suggestions for buildings, hotels, roads, and cities.
  - Pre-input support: opening the map with an existing address pre-centers the map and places the pin automatically.
  - Device GPS auto-detection button ("GPS Saya") for rapid current location pinning.
  - Quick action to open selected coordinates or address directly in Google Maps.
- **Enhanced Event Time Picker**:
  - Start time and end time inputs with timezone selectors (`WIB`, `WITA`, `WIT`).
- **Two-Step Event Deletion Confirmation**:
  - Step 1: Warning modal summarizing impacted guests.
  - Step 2: Verification modal requiring panitia to type the exact event title before permanent deletion.
- **Image Display Layout**:
  - Event banner images placed prominently above the event card header and dashboard hero.

### Changed
- **Pure Random Public URLs**:
  - Event registration slugs are now generated as pure unguessable alphanumeric tokens (`/e/evt-[random20]`) with no event title leakage, set to read-only in forms.
- **Git Hygiene**:
  - Added `_adminator_ref/` and temporary dump files to `.gitignore` to keep repositories clean.

### Fixed
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
