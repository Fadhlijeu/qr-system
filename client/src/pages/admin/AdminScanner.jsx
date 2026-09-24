import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "../../api";
import { QrCode, Camera, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Volume2, ArrowRight } from "lucide-react";

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
    // Ignore audio autoplay restrictions
  }
}

export function AdminScanner({ eventId, onCheckInComplete }) {
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
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
        () => {} // silent on frame without QR
      );

      setCameraActive(true);
    } catch (err) {
      console.warn("Camera start warning:", err);
      setCameraError("Kamera tidak dapat diakses atau diblokir oleh browser. Anda dapat menggunakan input kode manual di bawah.");
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

      if (onCheckInComplete) {
        onCheckInComplete();
      }
    } catch (err) {
      playBeep("error");
      setScanResult({
        status: "INVALID",
        message: err.message || "Gagal memverifikasi tiket.",
      });
    } finally {
      // Auto-clear result after 3 seconds so camera is ready for next attendee
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
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
      {/* Scanner Viewport Card */}
      <div className="glass-card overflow-hidden border border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-white text-base">QR Scanner Check-in</h2>
          </div>

          <div className="flex items-center gap-2">
            {cameraActive ? (
              <button
                onClick={stopCamera}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                Matikan Kamera
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Nyalakan Kamera
              </button>
            )}
          </div>
        </div>

        {/* Live Camera View Area */}
        <div className="p-4 bg-slate-950/60 flex flex-col items-center">
          <div
            id="qr-reader"
            className="w-full max-w-[320px] rounded-xl overflow-hidden border-2 border-indigo-500/30 shadow-inner"
            style={{ minHeight: "260px" }}
          ></div>

          {cameraError && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl max-w-md text-center">
              {cameraError}
            </div>
          )}

          <p className="text-xs text-slate-400 mt-3 text-center">
            Arahkan kamera ke QR Code peserta. Sistem akan memverifikasi otomatis dalam milidetik.
          </p>
        </div>

        {/* Manual Barcode / Ticket Code Input */}
        <div className="p-4 border-t border-white/10 bg-slate-900/50">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Atau ketik / scan nomor tiket (contoh: TKT-SUQG44)..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="input-field text-sm font-mono uppercase"
            />
            <button
              type="submit"
              disabled={!manualCode.trim() || isProcessing}
              className="btn-primary text-sm whitespace-nowrap px-4"
            >
              <span>Verifikasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Real-time Verification Feedback Modal / Banner */}
      {scanResult && (
        <div
          className={`p-5 rounded-2xl border transition-all animate-in fade-in zoom-in-95 duration-200 ${
            scanResult.status === "SUCCESS"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
              : scanResult.status === "ALREADY_CHECKED_IN"
              ? "bg-amber-950/80 border-amber-500/40 text-amber-200"
              : "bg-rose-950/80 border-rose-500/40 text-rose-200"
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

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold tracking-wide uppercase text-sm">
                  {scanResult.status === "SUCCESS" && "CHECK-IN SUCCESS ✅"}
                  {scanResult.status === "ALREADY_CHECKED_IN" && "ALREADY CHECKED IN ⚠️"}
                  {scanResult.status === "INVALID" && "INVALID QR ❌"}
                </span>
                <span className="text-xs opacity-75">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              <p className="text-sm font-medium">{scanResult.message}</p>

              {scanResult.participant && (
                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="opacity-75 block">Nama Peserta:</span>
                    <strong className="text-white text-sm">
                      {scanResult.participant.name}
                    </strong>
                  </div>
                  <div>
                    <span className="opacity-75 block">Instansi:</span>
                    <span className="text-slate-200">
                      {scanResult.participant.organization}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-75 block">Nomor Tiket:</span>
                    <span className="font-mono font-bold text-white">
                      {scanResult.participant.ticket_code}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-75 block">Waktu Kehadiran:</span>
                    <span>{scanResult.participant.checked_in_at || "Baru saja"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
