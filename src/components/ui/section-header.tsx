"use client";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      <h2 className="text-base font-bold text-white">{title}</h2>
      {action && (
        <button onClick={action.onClick} className="text-sm text-[#0D4F3C] dark:text-[#156B53] font-semibold hover:text-[#0D4F3C]/80 dark:hover:text-[#156B53]/80">
          {action.label}
        </button>
      )}
    </div>
  );
}
