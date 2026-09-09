"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, max = 100, color = "#0D4F3C", size = "md", showLabel, className }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const heights = { sm: "h-1", md: "h-1.5", lg: "h-2" };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("bg-gray-100 rounded-full overflow-hidden", heights[size])}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
