import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "../../api";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ArrowRight,
  History,
  QrCode,
  User,
  Clock
} from "lucide-react";

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
        qrbox: { width: 260, height: 260 },
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
        () => {} // silent on frame
      );

      setCameraActive(true);
    } catch (err) {
      console.warn("Camera start warning:", err);
      setCameraError(
        "Kamera tidak dapat diakses atau izin ditolak. Anda dapat menggunakan input nomor tiket manual di bawah."
      );
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {}
    }
    setCameraActive(false);
  };

  const handleCheckIn = async (codeToVerify) => {
    if (!codeToVerify || isProcessingRef.current) return;
    setIsProcessing(true);

    try {
      const res = await api.checkInQR(codeToVerify, eventId);
      setScanResult(res);

      if (res.status === "SUCCESS") {
        playBeep("success");
      } else if (res.status === "ALREADY_CHECKED_IN") {
        playBeep("warning");
      } else {
        playBeep("error");
      }

      // Add to session log
      setSessionLogs((prev) => [
        {
          id: Date.now(),
          status: res.status,
          code: res.participant?.ticket_code || res.code || codeToVerify,
          name: res.participant?.name || "Tidak Terdaftar",
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        },
        ...prev.slice(0, 4),
      ]);

      if (onCheckInComplete) {
        onCheckInComplete();
      }
    } catch (err) {
      playBeep("error");
      const errRes = {
        status: "INVALID",
        message: err.message || "Gagal memverifikasi tiket.",
        code: codeToVerify,
      };
      setScanResult(errRes);
      setSessionLogs((prev) => [
        {
          id: Date.now(),
          status: "INVALID",
          code: codeToVerify,
          name: "Gagal Verifikasi",
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        },
        ...prev.slice(0, 4),
      ]);
    } finally {
      // Auto clear feedback after 3.5s so next scan is ready
      setTimeout(() => {
        setIsProcessing(false);
      }, 2500);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleCheckIn(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <QrCode className="w-5 h-5 text-indigo-400" />
          <span>Verifikasi Kehadiran Tamu</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Arahkan QR Code peserta ke kamera atau ketik nomor tiket manual
        </p>
      </div>

      {/* Main Scanner Card */}
      <div className="card-pro overflow-hidden border border-white/10">
        <div className="p-3.5 border-b border-white/5 flex items-center justify-between bg-[#0e1424]">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-400" />
            <span>Kamera Pemindai</span>
          </span>

          {cameraActive ? (
            <button
              onClick={stopCamera}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
            >
              Matikan Kamera
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Hidupkan Kamera
            </button>
          )}
        </div>

        {/* Camera Viewport Area */}
        <div className="p-6 bg-slate-950/80 flex flex-col items-center justify-center">
          <div
            id="qr-reader"
            className="w-full max-w-[300px] rounded-xl overflow-hidden border-2 border-indigo-500/30 shadow-inner"
            style={{ minHeight: "260px" }}
          />

          {cameraError && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-lg max-w-sm text-center">
              {cameraError}
            </div>
          )}

          <p className="text-xs text-slate-400 mt-3 text-center">
            Posisikan QR tiket di tengah kotak pemindai
          </p>
        </div>

        {/* Manual Input Fallback */}
        <div className="p-4 border-t border-white/5 bg-[#0e1424]">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Atau ketik nomor tiket (contoh: TKT-7K9M2P)..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="input-field text-xs font-mono uppercase"
            />
            <button
              type="submit"
              disabled={!manualCode.trim() || isProcessing}
              className="btn-primary text-xs px-4 whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Verifikasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Prominent Verification Feedback Result */}
      {scanResult && (
        <div
          className={`card-pro p-5 border transition-all animate-in zoom-in-95 duration-150 ${
            scanResult.status === "SUCCESS"
              ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-200"
              : scanResult.status === "ALREADY_CHECKED_IN"
              ? "bg-amber-950/50 border-amber-500/50 text-amber-200"
              : "bg-rose-950/50 border-rose-500/50 text-rose-200"
          }`}
        >
          <div className="flex items-start gap-4">
            {scanResult.status === "SUCCESS" && (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {scanResult.status === "ALREADY_CHECKED_IN" && (
              <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
            )}
            {scanResult.status === "INVALID" && (
              <XCircle className="w-8 h-8 text-rose-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm uppercase tracking-wide">
                  {scanResult.status === "SUCCESS" && "CHECK-IN BERHASIL"}
                  {scanResult.status === "ALREADY_CHECKED_IN" && "SUDAH CHECK-IN SEBELUMNYA"}
                  {scanResult.status === "INVALID" && "QR TIDAK VALID"}
                </span>
                <span className="text-[11px] opacity-75 font-mono">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              <p className="text-xs">{scanResult.message}</p>

              {scanResult.participant && (
                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nama Peserta:</span>
                    <strong className="text-white text-sm">
                      {scanResult.participant.name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Instansi:</span>
                    <span className="text-slate-200 font-medium">
                      {scanResult.participant.organization}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nomor Tiket:</span>
                    <span className="font-mono font-bold text-indigo-300">
                      {scanResult.participant.ticket_code}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Waktu Check-in:</span>
                    <span className="text-slate-200 font-mono">
                      {scanResult.participant.checked_in_at?.substring(11, 16) || "Baru saja"} WIB
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Session Scan Log */}
      {sessionLogs.length > 0 && (
        <div className="card-pro overflow-hidden">
          <div className="p-3.5 border-b border-white/5 flex items-center justify-between text-xs text-slate-400 bg-[#0e1424]">
            <span className="font-semibold flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Log Scan Sesi Ini</span>
            </span>
            <span className="text-[11px]">{sessionLogs.length} scan terakhir</span>
          </div>

          <div className="divide-y divide-white/5">
            {sessionLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 px-4 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {log.status === "SUCCESS" ? (
                    <span className="badge badge-success text-[10px]">Hadir</span>
                  ) : log.status === "ALREADY_CHECKED_IN" ? (
                    <span className="badge badge-warning text-[10px]">Duplikat</span>
                  ) : (
                    <span className="badge badge-danger text-[10px]">Invalid</span>
                  )}
                  <span className="font-semibold text-white">{log.name}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>{log.code}</span>
                  <span>{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
