"use client";

import { cn } from "@/lib/utils";

interface GradientCardProps {
  gradientFrom: string;
  gradientTo: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GradientCard({ gradientFrom, gradientTo, children, className, onClick }: GradientCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-2xl p-5 overflow-hidden",
        onClick && "cursor-pointer",
        className
      )}
      style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
    >
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-4 border-gray-200" />
      {children}
    </div>
  );
}
