"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Landmark, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function GPCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-[#151A1F] border border-black/[0.04] dark:border-white/10 rounded-[24px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-black/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GPSectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-xs font-bold text-[#0C0F14] dark:text-white uppercase tracking-wide mb-3", className)}>
      {children}
    </h3>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export function GPPrimaryButton({ className, loading, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "w-full h-14 inline-flex items-center justify-center gap-2 bg-[#0D4F3C] hover:bg-[#156B53] active:scale-[0.99] text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
}

export function GPSecondaryButton({ className, loading, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "w-full h-12 inline-flex items-center justify-center gap-2 bg-white dark:bg-[#151A1F] border border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white font-semibold text-sm rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

const CHIP_TONES = {
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  gray: "bg-black/5 text-gray-600 dark:bg-white/10 dark:text-gray-300",
  primary: "bg-[#0D4F3C]/10 text-[#0D4F3C] dark:bg-[#156B53]/15 dark:text-emerald-300",
} as const;

export type ChipTone = keyof typeof CHIP_TONES;

export function GPChip({ tone = "gray", className, children }: { tone?: ChipTone; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase whitespace-nowrap",
        CHIP_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function GPPageHeader({
  title,
  eyebrow,
  onBack,
  right,
}: {
  title: string;
  eyebrow?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 pt-6 pb-4 max-w-xl mx-auto w-full flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="w-10 h-10 rounded-full bg-white dark:bg-[#151A1F] border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#0C0F14] dark:text-white" />
          </button>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 tracking-widest uppercase font-semibold">{eyebrow}</p>
          )}
          <h1 className="text-lg font-bold text-[#0C0F14] dark:text-white tracking-tight truncate">{title}</h1>
        </div>
      </div>
      {right}
    </motion.header>
  );
}

export function GPFullPageLoader() {
  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
      <Loader2 className="w-7 h-7 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
    </div>
  );
}

export function GPFullPageMessage({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col items-center justify-center p-6 text-center">
      <Landmark className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
      <p className="text-lg font-bold text-[#0C0F14] dark:text-white">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6 max-w-xs">{message}</p>
      <button
        onClick={onAction}
        className="px-6 py-2.5 bg-[#0D4F3C] hover:bg-[#156B53] active:scale-95 text-white font-bold text-xs rounded-full transition-all"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export function GPStickyFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-[#FBF6EF]/95 dark:bg-[#0C0F14]/95 backdrop-blur-xl border-t border-black/[0.06] dark:border-white/10 z-30">
      <div className="max-w-xl mx-auto space-y-2">{children}</div>
    </div>
  );
}

/** Drawer content colours matching the app's cards (the shadcn default uses theme vars). */
export const GP_DRAWER_CLASS =
  "bg-white dark:bg-[#151A1F] border-black/10 dark:border-white/10 max-h-[92vh] max-w-xl mx-auto";
