"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Flashlight, QrCode, Info, Camera } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  isCameraSupported,
  startCamera,
  stopCamera,
  ScanLoop,
  toggleFlash as toggleCameraFlash,
  parseCameraError,
} from "@/lib/camera";
import jsQR from "jsqr";

type CameraState =
  | "loading"
  | "active"
  | "denied"
  | "not-found"
  | "unsupported";

export default function ScanPage() {
  const router = useRouter();
  const [cameraState, setCameraState] = useState<CameraState>("loading");
  const [isScanning, setIsScanning] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanHint] = useState("Align QR code within frame");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<ScanLoop | null>(null);

  const cleanup = useCallback(() => {
    if (scanLoopRef.current) {
      scanLoopRef.current.stop();
      scanLoopRef.current = null;
    }

    if (streamRef.current) {
      stopCamera(streamRef.current);
      streamRef.current = null;
    }

    setIsScanning(false);
  }, []);

  const handleQRDetected = useCallback(
    (data: string) => {
      // Stop scanning immediately
      if (scanLoopRef.current) {
        scanLoopRef.current.stop();
      }

      try {
        // Parse QR data
        const parsed = JSON.parse(data);

        // Validate Vaulta payment QR
        if (parsed.type === "vaulta_payment") {
          cleanup();
          router.push(
            `/scan/result?data=${encodeURIComponent(JSON.stringify(parsed))}`
          );
        } else {
          throw new Error("Unsupported QR type");
        }
      } catch {
        // Invalid or unsupported QR
        cleanup();
        router.push("/scan/error?type=invalid");
      }
    },
    [router, cleanup]
  );

  const handleFrame = useCallback(
    (frame: ImageData) => {
      const code = jsQR(frame.data, frame.width, frame.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        handleQRDetected(code.data);
      }
    },
    [handleQRDetected]
  );

  const startScanning = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    scanLoopRef.current = new ScanLoop();

    scanLoopRef.current.start(videoRef.current, canvasRef.current, handleFrame);
  }, [handleFrame]);

  const initializeCamera = useCallback(async () => {
    // Check camera support
    if (!isCameraSupported()) {
      setCameraState("unsupported");
      return;
    }

    // Request camera access
    if (!videoRef.current) return;

    try {
      const stream = await startCamera(videoRef.current);
      streamRef.current = stream;
      setCameraState("active");

      // Start scanning after short delay
      setTimeout(() => {
        startScanning();
      }, 500);
    } catch (error) {
      const { type } = parseCameraError(error as Error);
      setCameraState(type === "denied" ? "denied" : "not-found");
    }
  }, [startScanning]);

  useEffect(() => {
    initializeCamera();

    return () => {
      cleanup();
    };
  }, [initializeCamera, cleanup]);

  const handleToggleFlash = async () => {
    if (!streamRef.current) return;

    const success = await toggleCameraFlash(streamRef.current, !flashEnabled);
    if (success) {
      setFlashEnabled(!flashEnabled);
    }
  };

  const handleClose = () => {
    cleanup();
    router.push("/dashboard");
  };

  // Camera Permission Denied
  if (cameraState === "denied") {
    return (
      <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col">
        <header role="banner" className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-[#0C0F14] dark:text-white">Scan</h1>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-xl bg-white dark:bg-[#151A1F] hover:bg-gray-50 dark:hover:bg-[#1A1F25] flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-[#0C0F14] dark:text-white" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={<Camera className="w-8 h-8" />}
            title="Camera access needed"
            description="Allow camera access to scan QR codes and make quick payments."
            action={{
              label: "Enable camera",
              onClick: initializeCamera,
            }}
          />
        </div>
      </main>
    );
  }

  // Active Camera State
  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] relative overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-5 pt-6 pb-4"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">Scan QR Code</h1>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-xl bg-black/30 hover:bg-black/40 dark:bg-[#1C2128] dark:hover:bg-[#252B35] flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </div>
      </motion.div>

      {/* Scan Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 flex items-center justify-center"
        style={{ height: "calc(100vh - 250px)" }}
      >
        <div className="relative w-64 h-64">
          {/* Corner Indicators */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#0D4F3C] dark:border-[#156B53] rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#0D4F3C] dark:border-[#156B53] rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#0D4F3C] dark:border-[#156B53] rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#0D4F3C] dark:border-[#156B53] rounded-br-2xl" />

          {/* Scanning Animation */}
          {isScanning && (
            <motion.div
              animate={{ y: [0, 256, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-[#0D4F3C] opacity-50"
            />
          )}
        </div>
      </motion.div>

      {/* Instruction Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 text-center px-6 mb-8"
      >
        <p className="text-white text-sm font-medium mb-2">{scanHint}</p>
        {isScanning && (
          <p className="text-gray-400 text-xs">Looking for a code…</p>
        )}
      </motion.div>

      {/* Bottom Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 px-5 pb-8"
      >
        <div className="flex items-center justify-center gap-4">
          {/* My QR Button */}
          <button
            onClick={() => router.push("/scan/my-qr")}
            className="flex flex-col items-center gap-2 px-6 py-3 rounded-2xl bg-black/30 hover:bg-black/40 dark:bg-[#1C2128] dark:hover:bg-[#252B35] transition-all"
          >
            <QrCode className="w-6 h-6 text-white" strokeWidth={2} />
            <span className="text-xs font-medium text-white">My QR</span>
          </button>

          {/* Flash Toggle */}
          <button
            onClick={handleToggleFlash}
            className={`flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all ${
              flashEnabled
                ? "bg-[#0D4F3C]/20 dark:bg-[#156B53]/20 text-[#0D4F3C] dark:text-[#156B53]"
                : "bg-black/30 hover:bg-black/40 dark:bg-[#1C2128] dark:hover:bg-[#252B35] text-white"
            }`}
          >
            <Flashlight className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Flash</span>
          </button>

          {/* Help Button */}
          <button
            onClick={() => router.push("/scan/help")}
            className="flex flex-col items-center gap-2 px-6 py-3 rounded-2xl bg-black/30 hover:bg-black/40 dark:bg-[#1C2128] dark:hover:bg-[#252B35] transition-all"
          >
            <Info className="w-6 h-6 text-white" strokeWidth={2} />
            <span className="text-xs font-medium text-white">Help</span>
          </button>
        </div>
      </motion.div>
    </main>
  );
}
