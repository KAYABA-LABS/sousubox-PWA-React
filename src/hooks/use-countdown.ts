import { useCallback, useEffect, useState } from "react";

/**
 * Countdown driven by an end timestamp, so it stays accurate even if the
 * tab/PWA is backgrounded and interval ticks get throttled.
 */
export function useCountdown(seconds: number) {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const start = useCallback(() => {
    setEndsAt(Date.now() + seconds * 1000);
    setSecondsLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (endsAt === null) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        setEndsAt(null);
      }
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return { secondsLeft, isRunning: secondsLeft > 0, start };
}

export function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
