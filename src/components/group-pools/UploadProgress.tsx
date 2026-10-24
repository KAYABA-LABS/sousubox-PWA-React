"use client";

import { Progress } from "@/components/ui/progress";
import { moderatorApplicationCopy as copy } from "@/lib/copy/moderatorApplication";

/** Upload progress for the application submit. `fraction` is 0–1. */
export function UploadProgress({ fraction }: { fraction: number }) {
  const percent = Math.min(100, Math.max(0, Math.round(fraction * 100)));
  const label = percent >= 100 ? copy.finishing : copy.sending(percent);

  return (
    <div className="space-y-1.5" aria-live="polite">
      <Progress
        value={percent}
        aria-label={label}
        className="h-2 bg-[#0D4F3C]/15 dark:bg-white/10 [&>div]:bg-[#0D4F3C] dark:[&>div]:bg-[#156B53]"
      />
      <p className="text-xs text-center font-semibold text-gray-600 dark:text-gray-300">{label}</p>
    </div>
  );
}
