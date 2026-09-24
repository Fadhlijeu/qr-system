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
