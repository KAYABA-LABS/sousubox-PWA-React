/**
 * Camera utility functions using native Web APIs
 * No external dependencies - production-ready for fintech PWA
 */

export interface CameraConstraints {
  video: {
    facingMode: { ideal: string };
    width: { ideal: number };
    height: { ideal: number };
  };
  audio: boolean;
}

// Fintech-safe defaults
export const CAMERA_CONSTRAINTS: CameraConstraints = {
  video: {
    facingMode: { ideal: "environment" }, // rear camera
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: false, // privacy principle
};

/**
 * Check if camera is supported in current environment
 */
export function isCameraSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

/**
 * Start camera stream and attach to video element
 */
export async function startCamera(
  videoElement: HTMLVideoElement
): Promise<MediaStream> {
  if (!isCameraSupported()) {
    throw new Error("Camera not supported");
  }

  const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);

  videoElement.srcObject = stream;
  videoElement.setAttribute("playsinline", "true"); // iOS fix
  videoElement.setAttribute("muted", "true");

  await videoElement.play();

  return stream;
}

/**
 * Stop camera stream cleanly (CRITICAL)
 * Must be called on route change, app background, or scan completion
 */
export function stopCamera(stream: MediaStream | null) {
  if (!stream) return;

  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

/**
 * Capture current frame from video for QR scanning
 */
export function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): ImageData | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Scan loop controller
 */
export class ScanLoop {
  private scanning = false;
  private animationFrameId: number | null = null;

  start(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    onFrame: (frame: ImageData) => void
  ) {
    this.scanning = true;

    const loop = () => {
      if (!this.scanning) return;

      const frame = captureFrame(video, canvas);
      if (frame) {
        onFrame(frame);
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    loop();
  }

  stop() {
    this.scanning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

/**
 * Parse camera permission error
 */
export function parseCameraError(error: Error): {
  type: "denied" | "not-found" | "unknown";
  message: string;
} {
  if (
    error.name === "NotAllowedError" ||
    error.name === "PermissionDeniedError"
  ) {
    return {
      type: "denied",
      message: "Camera access was denied. Please enable camera permissions.",
    };
  }

  if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
    return {
      type: "not-found",
      message: "No camera found on this device.",
    };
  }

  return {
    type: "unknown",
    message: "Failed to access camera. Please try again.",
  };
}

/**
 * Toggle camera flash/torch (if supported)
 */
export async function toggleFlash(
  stream: MediaStream,
  enabled: boolean
): Promise<boolean> {
  try {
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as MediaTrackCapabilities & {
      torch?: boolean;
    };

    if (!capabilities.torch) {
      return false; // Torch not supported
    }

    await track.applyConstraints({
      advanced: [{ torch: enabled } as MediaTrackConstraintSet],
    });

    return true;
  } catch (error) {
    console.error("Flash toggle failed:", error);
    return false;
  }
}
