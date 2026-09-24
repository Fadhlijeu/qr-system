import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "../../api";

// Web Audio API tone generator (zero external assets)
function playBeep(type = "success") {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.08); // D6
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } else if (type === "warning") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.setValueAtTime(330, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {
    // Ignore audio restrictions
  }
}

export function AdminScanner({ eventId, onCheckInComplete }) {
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);

  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (!isProcessingRef.current) {
            handleCheckIn(decodedText);
          }
        },
        () => {}
      );

      setCameraActive(true);
    } catch (err) {
      console.warn("Camera init warning:", err);
      setCameraActive(false);
      setCameraError(
        "Kamera tidak dapat diakses secara otomatis. Periksa izin kamera browser Anda atau gunakan input kode manual di bawah."
      );
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {}
    }
    setCameraActive(false);
  };

  const handleCheckIn = async (code) => {
    if (!code || isProcessingRef.current) return;

    setIsProcessing(true);
    try {
      const cleanCode = code.trim();
      const res = await api.checkInTicket(cleanCode);

      if (res.status === "ALREADY_CHECKED_IN") {
        playBeep("warning");
        setScanResult({
          type: "warning",
          title: "Sudah Check-In Sebelumnya",
          message: `Peserta ${res.participant?.name || "ini"} sudah divalidasi hadir pada ${
            res.participant?.checkin_time
              ? new Date(res.participant.checkin_time).toLocaleTimeString("id-ID")
              : "sesi sebelumnya"
          }.`,
          participant: res.participant,
        });
      } else {
        playBeep("success");
        setScanResult({
          type: "success",
          title: "Check-in Berhasil!",
          message: `Selamat datang, ${res.participant.name}!`,
          participant: res.participant,
        });
        if (onCheckInComplete) onCheckInComplete();
      }

      setSessionLogs((prev) => [
        {
          id: Date.now(),
          type: res.status === "ALREADY_CHECKED_IN" ? "warning" : "success",
          name: res.participant?.name || cleanCode,
          code: cleanCode,
          time: new Date().toLocaleTimeString("id-ID"),
        },
        ...prev.slice(0, 19),
      ]);
    } catch (err) {
      playBeep("error");
      setScanResult({
        type: "error",
        title: "Check-in Ditolak",
        message: err.message || "Kode tiket tidak valid atau tidak terdaftar pada acara ini.",
      });
      setSessionLogs((prev) => [
        {
          id: Date.now(),
          type: "error",
          name: "Gagal: " + code,
          code: code,
          time: new Date().toLocaleTimeString("id-ID"),
        },
        ...prev.slice(0, 19),
      ]);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCheckIn(manualCode.trim());
    setManualCode("");
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Validasi · Check-in</span>
          <h1 className="hero-title">Scan QR Tiket Tamu</h1>
          <p className="hero-sub">
            Gunakan kamera live untuk validasi instan kode QR tamu di pintu masuk, atau masukkan kode tiket secara manual.
          </p>
        </div>
      </section>

      <div className="grid">
        {/* Left Column: Camera Viewport & Manual Input */}
        <section className="col-12 card" style={{ gridColumn: "span 8" }}>
          <div className="card-head">
            <div className="card-title-wrap">
              <span className="eyebrow">Scanner Kamera</span>
              <h2 className="card-title">Live QR Viewport</h2>
            </div>
            <button onClick={startCamera} className="btn btn--sm btn--ghost">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>Restart Kamera</span>
            </button>
          </div>

          {/* Video Viewport Box */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "360px",
              margin: "0 auto 20px",
              aspectRatio: "1",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#0f172a",
              display: "grid",
              placeItems: "center"
            }}
          >
            <div id="qr-reader" style={{ width: "100%", height: "100%" }} />

            {/* Scanning Laser Animation */}
            {cameraActive && !isProcessing && (
              <div
                style={{
                  position: "absolute",
                  insetInline: "24px",
                  top: "50%",
                  height: "2px",
                  background: "var(--success)",
                  boxShadow: "0 0 8px var(--success)",
                  pointerEvents: "none"
                }}
              />
            )}

            {isProcessing && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(15, 23, 42, 0.8)",
                  backdropFilter: "blur(2px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  gap: "8px",
                  zIndex: 10
                }}
              >
                <div className="spinner lg"></div>
                <span style={{ fontSize: "12px", fontWeight: 600 }}>Memverifikasi Tiket...</span>
              </div>
            )}

            {cameraError && (
              <div style={{ position: "absolute", inset: 0, background: "var(--bg-muted)", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "8px" }}>
                <p style={{ fontSize: "12px", color: "var(--t-muted)", margin: 0 }}>{cameraError}</p>
                <button onClick={startCamera} className="btn btn--sm btn--primary">
                  Coba Akses Kamera
                </button>
              </div>
            )}
          </div>

          {/* Manual Input Group */}
          <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "16px" }}>
            <span className="eyebrow" style={{ display: "block", marginBottom: "8px" }}>
              Input Manual Barcode / ID Tiket
            </span>
            <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: "8px" }}>
              <div className="input-icon" style={{ flex: 1 }}>
                <span className="ico">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 8h10M7 12h10M7 16h6" />
                  </svg>
                </span>
                <input
                  className="input mono"
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan nomor tiket lengkap (misal: TKT-A8F2K9M7...)"
                />
              </div>
              <button type="submit" disabled={!manualCode.trim() || isProcessing} className="btn btn--primary">
                Validasi
              </button>
            </form>
          </div>

          {/* Real-time Scan Result using Adminator Alerts */}
          {scanResult && (
            <div style={{ marginTop: "16px" }}>
              <div className={`alert ${scanResult.type === "success" ? "success" : scanResult.type === "warning" ? "warning" : "danger"}`}>
                <div className="ico">
                  {scanResult.type === "success" ? (
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : scanResult.type === "warning" ? (
                    <svg viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  )}
                </div>
                <div className="body">
                  <div className="title">{scanResult.title}</div>
                  <div>{scanResult.message}</div>
                  {scanResult.participant && (
                    <div style={{ marginTop: "6px", fontSize: "12px", borderTop: "1px dashed rgba(0,0,0,0.1)", paddingTop: "6px" }}>
                      <strong>{scanResult.participant.name}</strong> · {scanResult.participant.organization || "Tamu"} · <span className="mono">{scanResult.participant.ticket_code}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Session Log */}
        <section className="col-12 card" style={{ gridColumn: "span 4", height: "540px", display: "flex", flexDirection: "column" }}>
          <div className="card-head">
            <div className="card-title-wrap">
              <span className="eyebrow">Aktivitas</span>
              <h2 className="card-title">Riwayat Sesi Ini</h2>
            </div>
            <span className="badge info">{sessionLogs.length} scan</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            {sessionLogs.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--t-light)", fontSize: "12px", margin: "auto 0", padding: "20px" }}>
                Belum ada tiket yang discan pada sesi scanner ini.
              </div>
            ) : (
              sessionLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: log.type === "success" ? "var(--success-soft)" : log.type === "warning" ? "var(--warning-soft)" : "var(--danger-soft)",
                    border: "1px solid var(--border-soft)",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px"
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "var(--t-base)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.name}
                    </div>
                    <div className="mono" style={{ fontSize: "10px", color: "var(--t-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.code}
                    </div>
                  </div>
                  <span style={{ fontSize: "10px", color: "var(--t-light)", shrink: 0 }}>
                    {log.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
