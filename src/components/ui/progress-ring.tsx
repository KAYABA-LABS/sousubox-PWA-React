"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number; // 0..1 fraction, clamped internally
  size: number; // px, square
  stroke: number; // px
  trackClassName?: string;
  progressClassName?: string;
  children?: ReactNode;
  className?: string;
}

export function ProgressRing({
  value,
  size,
  stroke,
  trackClassName = "text-black/10 dark:text-white/10",
  progressClassName = "text-[#0D4F3C] dark:text-[#156B53]",
  children,
  className,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, value));
  const offset = circumference * (1 - clamped);

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(progressClassName, "transition-[stroke-dashoffset] duration-500")}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
