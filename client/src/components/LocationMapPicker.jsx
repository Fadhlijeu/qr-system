import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Modern custom SVG pin for Leaflet to avoid Vite asset path issues
const createCustomPin = (label = "") => {
  return L.divIcon({
    className: "custom-leaflet-pin",
    html: `
      <div style="position: relative; transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: grab;">
        <div style="background: #2563eb; color: #ffffff; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 12px rgba(37,99,235,0.4); margin-bottom: 2px; border: 1.5px solid #ffffff; max-width: 180px; overflow: hidden; text-overflow: ellipsis;">
          ${label || "Titik Acara"}
        </div>
        <svg width="30" height="38" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
          <path d="M12 0C5.37258 0 0 5.37258 0 12C0 19.5 12 30 12 30C12 30 24 19.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="#2563eb"/>
          <circle cx="12" cy="11" r="5" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

function formatAddress(data) {
  if (!data) return "";
  const addr = data.address || {};
  const parts = [];

  const mainName = data.name || addr.amenity || addr.building || addr.shop || addr.tourism || addr.office || addr.leisure;
  if (mainName) parts.push(mainName);

  const road = [addr.road, addr.house_number].filter(Boolean).join(" No. ");
  if (road && !parts.includes(road)) parts.push(road);

  const area = addr.suburb || addr.neighbourhood || addr.village || addr.quarter;
  if (area && !parts.includes(area)) parts.push(area);

  const city = addr.city || addr.town || addr.municipality || addr.city_district || addr.county;
  if (city && !parts.includes(city)) parts.push(city);

  const state = addr.state;
  if (state && !parts.includes(state)) parts.push(state);

  if (parts.length > 0) {
    return parts.join(", ");
  }
  return data.display_name || "";
}

export function LocationMapPicker({ initialValue, onSelectLocation, onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialValue || "");
  const [coordinates, setCoordinates] = useState(null); // { lat, lng }
  const [detectingGps, setDetectingGps] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center (Jakarta / Monas)
    const defaultLat = -6.2088;
    const defaultLng = 106.8456;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([defaultLat, defaultLng], 13);

    mapInstanceRef.current = map;

    // High-performance CartoDB Voyager tile layer (Fastly CDN, prevents volunteer-server 403 access blocks)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    ).addTo(map);

    // Left-click: pans/navigates map
    // Right-click: picks/drops the pin and reverse geocodes
    map.on("contextmenu", (e) => {
      if (e.originalEvent) {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
      }
      const { lat, lng } = e.latlng;
      placeMarker(lat, lng, true);
    });

    // Handle invalid size bug when rendered in modal
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    // Pre-input handling: If initialValue exists, geocode it to place initial pin
    if (initialValue && initialValue.trim()) {
      geocodeAddress(initialValue.trim());
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Place or move marker
  const placeMarker = (lat, lng, doReverse = true, customLabel = "") => {
    setCoordinates({ lat, lng });
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!markerRef.current) {
      const marker = L.marker([lat, lng], {
        icon: createCustomPin(customLabel),
        draggable: true,
      }).addTo(map);

      marker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        setCoordinates({ lat: pos.lat, lng: pos.lng });
        reverseGeocode(pos.lat, pos.lng);
      });

      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setIcon(createCustomPin(customLabel));
    }

    map.flyTo([lat, lng], Math.max(map.getZoom(), 16), {
      duration: 0.8,
    });

    if (doReverse) {
      reverseGeocode(lat, lng);
    }
  };

  // Reverse Geocoding: Coordinates -> Address
  const reverseGeocode = async (lat, lng) => {
    setReverseLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "id,en",
          },
        }
      );
      if (!res.ok) throw new Error("Gagal mengambil data alamat");
      const data = await res.json();
      const formatted = formatAddress(data);
      if (formatted) {
        setSelectedAddress(formatted);
        if (onSelectLocation) {
          onSelectLocation(formatted, { lat, lng });
        }
        if (markerRef.current) {
          const shortName = (formatted.split(",")[0] || "Titik Acara").trim();
          markerRef.current.setIcon(createCustomPin(shortName));
        }
      }
    } catch (err) {
      console.warn("Reverse geocode error:", err);
      // Fallback coordinate representation
      const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSelectedAddress(fallback);
      if (onSelectLocation) {
        onSelectLocation(fallback, { lat, lng });
      }
    } finally {
      setReverseLoading(false);
    }
  };

  // Geocode: Address -> Coordinates (for pre-input or search)
  const geocodeAddress = async (query) => {
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1&addressdetails=1`,
        {
          headers: { "Accept-Language": "id,en" },
        }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const formatted = formatAddress(item) || query;
        setSelectedAddress(formatted);
        placeMarker(lat, lng, false, (formatted.split(",")[0] || "").trim());
      }
    } catch (err) {
      console.warn("Geocode error:", err);
    } finally {
      setSearching(false);
    }
  };

  // Live search for suggestions
  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&addressdetails=1`,
        {
          headers: { "Accept-Language": "id,en" },
        }
      );
      const data = await res.json();
      setSearchResults(data || []);
      if (!data || data.length === 0) {
        setErrorMsg("Tidak ada tempat yang cocok. Coba kata kunci lain.");
      }
    } catch (err) {
      setErrorMsg("Gagal melakukan pencarian lokasi.");
    } finally {
      setSearching(false);
    }
  };

  // Select item from search results
  const handleSelectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const formatted = formatAddress(item);
    setSelectedAddress(formatted);
    if (onSelectLocation) {
      onSelectLocation(formatted, { lat, lng });
    }
    setSearchResults([]);
    setSearchQuery("");
    placeMarker(lat, lng, false, (formatted.split(",")[0] || "").trim());
  };

  // GPS Current Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung deteksi lokasi GPS.");
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGps(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        placeMarker(lat, lng, true, "Lokasi Saya");
      },
      (err) => {
        setDetectingGps(false);
        alert("Gagal mengakses GPS: " + (err.message || "Izin lokasi ditolak"));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Confirm selection
  const handleConfirm = () => {
    if (!selectedAddress) {
      alert("Silakan klik titik lokasi pada peta atau cari tempat terlebih dahulu.");
      return;
    }
    onSelectLocation(selectedAddress, coordinates);
    if (onClose) onClose();
  };

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "hidden",
        background: "var(--bg-card, #ffffff)",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        marginTop: "10px",
      }}
    >
      {/* Top Search & Controls Bar */}
      <div
        style={{
          padding: "12px 14px",
          background: "var(--bg-subtle, #f8fafc)",
          borderBottom: "1px solid var(--border-soft)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2.2">
              <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--t-base)" }}>
              Pilih Titik Lokasi Acara
            </span>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={detectingGps}
              className="btn btn--sm btn--ghost"
              style={{ fontSize: "11px", padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px" }}
              title="Gunakan posisi GPS saat ini"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9" />
              </svg>
              <span>{detectingGps ? "Mencari GPS..." : "GPS Saya"}</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn--sm btn--ghost"
                style={{ fontSize: "11px", padding: "4px 8px" }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Search Input Bar (div, not form, to prevent parent form submission) */}
        <div style={{ position: "relative", display: "flex", gap: "6px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              className="input"
              style={{ fontSize: "12.5px", padding: "7px 10px", width: "100%" }}
              placeholder="Cari gedung, hotel, jalan, atau daerah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearch(e);
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--t-muted)",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="btn btn--primary btn--sm"
            style={{ fontSize: "12px", padding: "0 14px", flexShrink: 0 }}
          >
            {searching ? "Mencari..." : "Cari"}
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              maxHeight: "180px",
              overflowY: "auto",
            }}
          >
            {searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSearchResult(item)}
                style={{
                  padding: "8px 12px",
                  fontSize: "12px",
                  borderBottom: idx < searchResults.length - 1 ? "1px solid var(--border-soft)" : "none",
                  cursor: "pointer",
                  lineHeight: 1.4,
                  transition: "background .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted, #f1f5f9)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ fontWeight: 600, color: "var(--t-base)" }}>
                  {item.name || item.address?.road || item.display_name?.split(",")[0]}
                </div>
                <div style={{ fontSize: "11px", color: "var(--t-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.display_name}
                </div>
              </div>
            ))}
          </div>
        )}

        {errorMsg && (
          <div style={{ fontSize: "11.5px", color: "var(--danger)", padding: "2px 4px" }}>
            {errorMsg}
          </div>
        )}
      </div>

      {/* Interactive Map Box */}
      <div
        onContextMenu={(e) => e.preventDefault()}
        style={{ position: "relative", width: "100%", height: "290px" }}
      >
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Bottom Bar: Detected Address & Actions */}
      <div
        style={{
          padding: "12px 14px",
          background: "var(--bg-subtle, #f8fafc)",
          borderTop: "1px solid var(--border-soft)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--t-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" }}>
            {reverseLoading ? "Mendeteksi Alamat..." : "Alamat Terdeteksi:"}
          </div>
          <div
            style={{
              fontSize: "12.5px",
              fontWeight: 600,
              color: selectedAddress ? "var(--t-base)" : "var(--t-light)",
              minHeight: "20px",
              lineHeight: 1.45,
            }}
          >
            {reverseLoading ? (
              <span style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="spinner sm" style={{ width: "12px", height: "12px", borderWidth: "2px" }}></span>
                Mengambil nama tempat...
              </span>
            ) : selectedAddress ? (
              selectedAddress
            ) : (
              "-"
            )}
          </div>
          {coordinates && (
            <div style={{ fontSize: "11px", color: "var(--t-muted)", marginTop: "3px", fontFamily: "monospace" }}>
              Koordinat: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", paddingTop: "4px" }}>
          {coordinates ? (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: "11.5px", color: "var(--primary)", fontWeight: 600 }}
            >
              Buka di Google Maps ↗
            </a>
          ) : selectedAddress ? (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAddress)}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: "11.5px", color: "var(--primary)", fontWeight: 600 }}
            >
              Buka di Google Maps ↗
            </a>
          ) : <div />}

          <div style={{ display: "flex", gap: "8px" }}>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn--sm btn--ghost"
                style={{ fontSize: "12px" }}
              >
                Batal
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedAddress || reverseLoading}
              className="btn btn--sm btn--primary"
              style={{ fontSize: "12px", padding: "6px 16px" }}
            >
              Gunakan Alamat Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
